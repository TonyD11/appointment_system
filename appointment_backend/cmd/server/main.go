package main

import (
	"fmt"
	"log"
	"net/http"

	"appointment/cmd/config"
	"appointment/internal/database"
	"appointment/internal/handlers"
)

func main() {

	// Load config from .env
	cfg := config.LoadConfig()

	// Connect to MongoDB
	client := database.ConnectDB()

	// Get collections
	appointmentsCol := client.Database("appointment").Collection("appointments")
	doctorsCol := client.Database("appointment").Collection("doctors")
	patientsCol := client.Database("appointment").Collection("patients")

	// Seed doctors
	database.SeedDoctors(client)

	// Create handlers
	h := handlers.NewHandler(appointmentsCol, doctorsCol)

	auth := handlers.NewAuthHandler(
		patientsCol,
		cfg.SMTPHost,
		cfg.SMTPPort,
		cfg.SMTPUser,
		cfg.SMTPPass,
		cfg.SenderEmail,
		cfg.JWTSecret,
	)

	// Auth routes
	http.HandleFunc("/auth/register", func(w http.ResponseWriter, r *http.Request) {
		allowCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodPost {
			auth.Register(w, r)
		}
	})

	http.HandleFunc("/auth/login", func(w http.ResponseWriter, r *http.Request) {
		allowCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodPost {
			auth.Login(w, r)
		}
	})

	http.HandleFunc("/auth/forgot-password", func(w http.ResponseWriter, r *http.Request) {
		allowCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodPost {
			auth.ForgotPassword(w, r)
		}
	})

	http.HandleFunc("/auth/reset-password", func(w http.ResponseWriter, r *http.Request) {
		allowCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodPost {
			auth.ResetPassword(w, r)
		}
	})

	// Doctor routes
	http.HandleFunc("/doctors", func(w http.ResponseWriter, r *http.Request) {
		allowCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodGet {
			h.GetDoctors(w, r)
		}
	})

	// Appointment routes
	http.HandleFunc("/appointments", func(w http.ResponseWriter, r *http.Request) {
		allowCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodGet {
			h.GetAppointments(w, r)
		}
		if r.Method == http.MethodPost {
			h.CreateAppointment(w, r)
		}
	})

	http.HandleFunc("/appointments/", func(w http.ResponseWriter, r *http.Request) {
		allowCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodPut {
			h.UpdateAppointment(w, r)
		}
		if r.Method == http.MethodDelete {
			h.DeleteAppointment(w, r)
		}
	})

	// Start server
	fmt.Println("Server running at http://localhost:" + cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, nil))
}

func allowCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
