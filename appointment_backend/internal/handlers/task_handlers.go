package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"appointment/internal/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Handler struct {
	Appointments *mongo.Collection
	Doctors      *mongo.Collection
}

func NewHandler(appointments, doctors *mongo.Collection) *Handler {
	return &Handler{
		Appointments: appointments,
		Doctors:      doctors,
	}
}

func sendJSON(w http.ResponseWriter, statusCode int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

func (h *Handler) GetDoctors(w http.ResponseWriter, r *http.Request) {

	cursor, err := h.Doctors.Find(context.TODO(), bson.M{})
	if err != nil {
		sendJSON(w, 500, map[string]string{"error": "Cannot get doctors"})
		return
	}

	var doctors []model.Doctor
	cursor.All(context.TODO(), &doctors)

	sendJSON(w, 200, doctors)
}

func (h *Handler) GetAppointments(w http.ResponseWriter, r *http.Request) {

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := h.Appointments.Find(context.TODO(), bson.M{}, opts)
	if err != nil {
		sendJSON(w, 500, map[string]string{"error": "Cannot get appointments"})
		return
	}

	var appointments []model.Appointment
	cursor.All(context.TODO(), &appointments)

	sendJSON(w, 200, appointments)
}

func (h *Handler) CreateAppointment(w http.ResponseWriter, r *http.Request) {

	var body model.Appointment
	json.NewDecoder(r.Body).Decode(&body)

	if body.PatientName == "" || body.DoctorID == "" || body.ContactNumber == "" {
		sendJSON(w, 400, map[string]string{"error": "Please fill all fields"})
		return
	}

	doctorOID, _ := primitive.ObjectIDFromHex(body.DoctorID)
	var doctor model.Doctor
	h.Doctors.FindOne(context.TODO(), bson.M{"_id": doctorOID}).Decode(&doctor)

	newAppointment := model.Appointment{
		ID:            primitive.NewObjectID(),
		PatientName:   body.PatientName,
		DoctorID:      body.DoctorID,
		DoctorName:    doctor.Name,
		ContactNumber: body.ContactNumber,
		CreatedAt:     time.Now(),
	}

	h.Appointments.InsertOne(context.TODO(), newAppointment)

	fmt.Println("New appointment created for:", newAppointment.PatientName)
	sendJSON(w, 201, newAppointment)
}

func (h *Handler) UpdateAppointment(w http.ResponseWriter, r *http.Request) {

	id := strings.TrimPrefix(r.URL.Path, "/appointments/")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		sendJSON(w, 400, map[string]string{"error": "Invalid ID"})
		return
	}

	var body model.Appointment
	json.NewDecoder(r.Body).Decode(&body)

	doctorOID, _ := primitive.ObjectIDFromHex(body.DoctorID)
	var doctor model.Doctor
	h.Doctors.FindOne(context.TODO(), bson.M{"_id": doctorOID}).Decode(&doctor)

	update := bson.M{
		"$set": bson.M{
			"patientName":   body.PatientName,
			"doctorId":      body.DoctorID,
			"doctorName":    doctor.Name,
			"contactNumber": body.ContactNumber,
		},
	}
	h.Appointments.UpdateOne(context.TODO(), bson.M{"_id": oid}, update)

	fmt.Println("Appointment updated:", id)
	sendJSON(w, 200, map[string]string{"message": "Updated successfully"})
}

func (h *Handler) DeleteAppointment(w http.ResponseWriter, r *http.Request) {

	id := strings.TrimPrefix(r.URL.Path, "/appointments/")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		sendJSON(w, 400, map[string]string{"error": "Invalid ID"})
		return
	}

	h.Appointments.DeleteOne(context.TODO(), bson.M{"_id": oid})

	fmt.Println("Appointment deleted:", id)
	sendJSON(w, 200, map[string]string{"message": "Deleted successfully"})
}
