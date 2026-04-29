package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/smtp"
	"time"

	"appointment/internal/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	Patients  *mongo.Collection
	GmailUser string
	GmailPass string
	JWTSecret string
}

func NewAuthHandler(patients *mongo.Collection, gmailUser, gmailPass, jwtSecret string) *AuthHandler {
	return &AuthHandler{
		Patients:  patients,
		GmailUser: gmailUser,
		GmailPass: gmailPass,
		JWTSecret: jwtSecret,
	}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	if body.Username == "" || body.Email == "" || body.Password == "" {
		sendJSON(w, 400, map[string]string{"error": "All fields are required"})
		return
	}

	var existing model.Patient
	err := h.Patients.FindOne(context.TODO(), bson.M{"email": body.Email}).Decode(&existing)
	if err == nil {
		sendJSON(w, 400, map[string]string{"error": "Email already registered"})
		return
	}

	err = h.Patients.FindOne(context.TODO(), bson.M{"username": body.Username}).Decode(&existing)
	if err == nil {
		sendJSON(w, 400, map[string]string{"error": "Username already taken"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		sendJSON(w, 500, map[string]string{"error": "Error hashing password"})
		return
	}

	patient := model.Patient{
		ID:        primitive.NewObjectID(),
		Username:  body.Username,
		Email:     body.Email,
		Password:  string(hashedPassword),
		CreatedAt: time.Now(),
	}

	h.Patients.InsertOne(context.TODO(), patient)
	fmt.Println("New patient registered:", patient.Email)
	sendJSON(w, 201, map[string]string{"message": "Account created successfully!"})

}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	if body.Email == "" || body.Password == "" {
		sendJSON(w, 400, map[string]string{"error": "Email and password are required"})
		return
	}

	var patient model.Patient
	err := h.Patients.FindOne(context.TODO(), bson.M{"email": body.Email}).Decode(&patient)
	if err != nil {
		sendJSON(w, 401, map[string]string{"error": "Invalid email or password"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(patient.Password), []byte(body.Password))
	if err != nil {
		sendJSON(w, 401, map[string]string{"error": "Invalid email or password"})
		return
	}

	fmt.Println("Patient logged in:", patient.Email)
	sendJSON(w, 200, map[string]interface{}{
		"message":  "Login successful!",
		"id":       patient.ID,
		"username": patient.Username,
		"email":    patient.Email,
	})
}

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	if body.Email == "" {
		sendJSON(w, 400, map[string]string{"error": "Email is required"})
		return
	}

	var patient model.Patient
	err := h.Patients.FindOne(context.TODO(), bson.M{"email": body.Email}).Decode(&patient)
	if err != nil {
		// Don't reveal if email exists (security)
		sendJSON(w, 200, map[string]string{"message": "If this email exists, a reset link has been sent."})
		return
	}

	// Generate reset token
	tokenBytes := make([]byte, 16)
	rand.Read(tokenBytes)
	resetToken := hex.EncodeToString(tokenBytes)

	// Save token with 1 hour expiry
	expiry := time.Now().Add(1 * time.Hour)
	h.Patients.UpdateOne(
		context.TODO(),
		bson.M{"_id": patient.ID},
		bson.M{"$set": bson.M{
			"resetToken":  resetToken,
			"resetExpiry": expiry,
		}},
	)

	// Send reset email
	resetLink := fmt.Sprintf("http://localhost:5173?token=%s", resetToken)
	err = h.sendResetEmail(patient.Email, patient.Username, resetLink)
	if err != nil {
		fmt.Println("Email error:", err)
		sendJSON(w, 500, map[string]string{"error": "Failed to send email. Check your Gmail settings in .env"})
		return
	}

	fmt.Println("Reset email sent to:", patient.Email)
	sendJSON(w, 200, map[string]string{"message": "Password reset link sent to your email!"})
}

// -------------------------------------------------------
// POST /auth/reset-password
// -------------------------------------------------------

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	if body.Token == "" || body.Password == "" {
		sendJSON(w, 400, map[string]string{"error": "Token and new password are required"})
		return
	}

	// Find patient by token
	var patient model.Patient
	err := h.Patients.FindOne(context.TODO(), bson.M{"resetToken": body.Token}).Decode(&patient)
	if err != nil {
		sendJSON(w, 400, map[string]string{"error": "Invalid or expired reset link"})
		return
	}

	// Check token not expired
	if time.Now().After(patient.ResetExpiry) {
		sendJSON(w, 400, map[string]string{"error": "Reset link has expired. Please request a new one."})
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		sendJSON(w, 500, map[string]string{"error": "Cannot hash password"})
		return
	}

	// Update password and clear token
	h.Patients.UpdateOne(
		context.TODO(),
		bson.M{"_id": patient.ID},
		bson.M{"$set": bson.M{
			"password":    string(hashedPassword),
			"resetToken":  "",
			"resetExpiry": time.Time{},
		}},
	)

	fmt.Println("Password reset for:", patient.Email)
	sendJSON(w, 200, map[string]string{"message": "Password updated! You can now login."})
}

func (h *AuthHandler) sendResetEmail(toEmail, username, resetLink string) error {
	auth := smtp.PlainAuth("", h.GmailUser, h.GmailPass, "smtp.gmail.com")

	body := fmt.Sprintf(`
		<h2>Password Reset - Appointment System</h2>
		<p>Hi <strong>%s</strong>,</p>
		<p>Click the button below to reset your password:</p>
		<a href="%s" style="display:inline-block;background:#2c3e50;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
			Reset My Password
		</a>
		<p>This link expires in <strong>1 hour</strong>.</p>
		<p>If you did not request this, ignore this email.</p>
	`, username, resetLink)

	message := []byte(
		"To: " + toEmail + "\r\n" +
			"Subject: Password Reset - Appointment System\r\n" +
			"MIME-version: 1.0;\r\nContent-Type: text/html; charset=\"UTF-8\";\r\n\r\n" +
			body,
	)

	return smtp.SendMail("smtp.gmail.com:587", auth, h.GmailUser, []string{toEmail}, message)
}
