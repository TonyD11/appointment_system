package database

import (
	"context"
	"fmt"
	"log"

	"appointment/internal/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const mongoURI = "mongodb://localhost:27017"

func ConnectDB() *mongo.Client {

	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("Cannot connect to MongoDB:", err)
	}

	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal("MongoDB is not running! Start MongoDB first.", err)
	}

	fmt.Println("Connected to MongoDB!")
	return client
}

func SeedDoctors(client *mongo.Client) {
	col := client.Database("appointment").Collection("doctors")

	count, _ := col.CountDocuments(context.TODO(), bson.M{})
	if count > 0 {
		fmt.Println("Doctors already exist, skipping.")
		return
	}

	doctors := []interface{}{
		model.Doctor{Name: "Dr. Amara Perera", Speciality: "General Physician"},
		model.Doctor{Name: "Dr. Nuwan Fernando", Speciality: "Cardiologist"},
		model.Doctor{Name: "Dr. Sachini Silva", Speciality: "Dermatologist"},
		model.Doctor{Name: "Dr. Kasun Rajapaksa", Speciality: "Neurologist"},
		model.Doctor{Name: "Dr. Dilini Jayawardena", Speciality: "Pediatrician"},
	}

	col.InsertMany(context.TODO(), doctors)
	fmt.Println("Doctors added to database!")
}
