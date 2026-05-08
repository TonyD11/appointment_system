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

// AuthHandler holds collections and Brevo SMTP config
type AuthHandler struct {
	Patients    *mongo.Collection
	SMTPHost    string
	SMTPPort    string
	SMTPUser    string
	SMTPPass    string
	SenderEmail string
	JWTSecret   string
}

// NewAuthHandler creates a new AuthHandler — 7 parameters
func NewAuthHandler(
	patients *mongo.Collection,
	smtpHost, smtpPort, smtpUser, smtpPass, senderEmail, jwtSecret string,
) *AuthHandler {
	return &AuthHandler{
		Patients:    patients,
		SMTPHost:    smtpHost,
		SMTPPort:    smtpPort,
		SMTPUser:    smtpUser,
		SMTPPass:    smtpPass,
		SenderEmail: senderEmail,
		JWTSecret:   jwtSecret,
	}
}

// ── POST /auth/register
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

	var err error
	var existing model.Patient

	err = h.Patients.FindOne(context.TODO(), bson.M{"email": body.Email}).Decode(&existing)
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

	// Send welcome email in background
	go h.sendWelcomeEmail(patient.Email, patient.Username)

	sendJSON(w, 201, map[string]string{"message": "Account created successfully!"})
}

// ── POST /auth/login
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

	// Send login notification in background
	go h.sendLoginEmail(patient.Email, patient.Username)

	sendJSON(w, 200, map[string]interface{}{
		"message":  "Login successful!",
		"id":       patient.ID,
		"username": patient.Username,
		"email":    patient.Email,
	})
}

// ── POST /auth/forgot-password
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

	// Send reset email in background
	resetLink := fmt.Sprintf("http://localhost:5173?token=%s", resetToken)
	go h.sendResetEmail(patient.Email, patient.Username, resetLink)

	fmt.Println("Reset email sent to:", patient.Email)
	sendJSON(w, 200, map[string]string{"message": "Password reset link sent to your email!"})
}

// ── POST /auth/reset-password
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

	var patient model.Patient
	err := h.Patients.FindOne(context.TODO(), bson.M{"resetToken": body.Token}).Decode(&patient)
	if err != nil {
		sendJSON(w, 400, map[string]string{"error": "Invalid or expired reset link"})
		return
	}

	if time.Now().After(patient.ResetExpiry) {
		sendJSON(w, 400, map[string]string{"error": "Reset link has expired. Please request a new one."})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		sendJSON(w, 500, map[string]string{"error": "Cannot hash password"})
		return
	}

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

// ── EMAIL FUNCTIONS using Brevo SMTP ──────────────────

func (h *AuthHandler) sendWelcomeEmail(toEmail, username string) {
	subject := "Welcome to Appointment System!"
	body := fmt.Sprintf(`
		<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
			<h2 style="color:#2c3e50">Welcome, %s! 🎉</h2>
			<p>Your account has been created successfully.</p>
			<p>You can now login and book appointments.</p>
			<p style="color:#888;font-size:13px">
				If you did not create this account, please ignore this email.
			</p>
		</div>
	`, username)
	err := h.sendEmail(toEmail, subject, body)
	if err != nil {
		fmt.Println("Welcome email error:", err)
	} else {
		fmt.Println("Welcome email sent to:", toEmail)
	}
}

func (h *AuthHandler) sendLoginEmail(toEmail, username string) {
	now := time.Now().Format("02 Jan 2006 at 15:04")
	subject := "New Login to Your Account"
	body := fmt.Sprintf(`
		<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
			<h2 style="color:#2c3e50">New Login Detected 🔐</h2>
			<p>Hi <strong>%s</strong>,</p>
			<p>Someone just logged into your account.</p>
			<div style="background:#f8f9fa;border-radius:8px;padding:14px;margin:16px 0">
				<p style="margin:0"><strong>Time:</strong> %s</p>
			</div>
			<p>If this was you, no action is needed.</p>
			<p style="color:#e74c3c">If this was <strong>not you</strong>, please reset your password immediately.</p>
		</div>
	`, username, now)
	err := h.sendEmail(toEmail, subject, body)
	if err != nil {
		fmt.Println("Login email error:", err)
	} else {
		fmt.Println("Login notification sent to:", toEmail)
	}
}

func (h *AuthHandler) sendResetEmail(toEmail, username, resetLink string) {
	subject := "Password Reset Request"
	body := fmt.Sprintf(`
		<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
			<h2 style="color:#2c3e50">Reset Your Password 🔑</h2>
			<p>Hi <strong>%s</strong>,</p>
			<p>Click the button below to reset your password:</p>
			<div style="text-align:center;margin:24px 0">
				<a href="%s" style="background:#2c3e50;color:#fff;padding:12px 28px;
				border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">
					Reset My Password
				</a>
			</div>
			<p>This link expires in <strong>1 hour</strong>.</p>
			<p style="color:#888;font-size:13px">If you did not request this, ignore this email.</p>
		</div>
	`, username, resetLink)
	err := h.sendEmail(toEmail, subject, body)
	if err != nil {
		fmt.Println("Reset email error:", err)
	} else {
		fmt.Println("Reset email sent to:", toEmail)
	}
}

// sendEmail - sends via Brevo SMTP
func (h *AuthHandler) sendEmail(toEmail, subject, body string) error {
	auth := smtp.PlainAuth("", h.SMTPUser, h.SMTPPass, h.SMTPHost)
	message := []byte(
		"From: Appointment System <" + h.SenderEmail + ">\r\n" +
			"To: " + toEmail + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"MIME-version: 1.0;\r\n" +
			"Content-Type: text/html; charset=\"UTF-8\";\r\n" +
			"\r\n" +
			body,
	)
	return smtp.SendMail(
		h.SMTPHost+":"+h.SMTPPort,
		auth,
		h.SenderEmail,
		[]string{toEmail},
		message,
	)
}
