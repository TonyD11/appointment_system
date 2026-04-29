package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Doctor struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name       string             `bson:"name"          json:"name"`
	Speciality string             `bson:"speciality"    json:"speciality"`
}

type Appointment struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PatientName   string             `bson:"patientName"   json:"patientName"`
	DoctorID      string             `bson:"doctorId"      json:"doctorId"`
	DoctorName    string             `bson:"doctorName"    json:"doctorName"`
	ContactNumber string             `bson:"contactNumber" json:"contactNumber"`
	CreatedAt     time.Time          `bson:"createdAt"     json:"createdAt"`
}

// Patient holds login information for a patient
type Patient struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username    string             `bson:"username"      json:"username"`
	Email       string             `bson:"email"         json:"email"`
	Password    string             `bson:"password"      json:"-"`
	ResetToken  string             `bson:"resetToken"    json:"-"`
	ResetExpiry time.Time          `bson:"resetExpiry"   json:"-"`
	CreatedAt   time.Time          `bson:"createdAt"     json:"createdAt"`
}
