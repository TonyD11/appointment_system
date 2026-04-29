package main

import (
	"fmt"
	"log"
	"net/http"

	"appointment/internal/database"
	"appointment/internal/handlers"
)

func main() {

	client := database.ConnectDB()

	appointmentsCol := client.Database("appointment").Collection("appointments")
	doctorsCol := client.Database("appointment").Collection("doctors")

	database.SeedDoctors(client)

	h := handlers.NewHandler(appointmentsCol, doctorsCol)

	// GET /doctors
	http.HandleFunc("/doctors", func(w http.ResponseWriter, r *http.Request) {
		allowCORS(w)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodGet {
			h.GetDoctors(w, r)
		}
	})

	// GET + POST /appointments
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

	// PUT + DELETE /appointments/{id}
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

	fmt.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func allowCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
