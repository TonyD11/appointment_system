package config

import (
	"bufio"
	"os"
	"strings"
)

// Config holds all settings from .env file
type Config struct {
	MongoURI    string
	SMTPHost    string
	SMTPPort    string
	SMTPUser    string
	SMTPPass    string
	SenderEmail string
	JWTSecret   string
	Port        string
}

// LoadConfig reads .env file and returns all settings
func LoadConfig() Config {
	readEnvFile(".env")
	return Config{
		MongoURI:    getEnv("MONGO_URI", "mongodb://localhost:27017"),
		SMTPHost:    getEnv("SMTP_HOST", "smtp-relay.brevo.com"),
		SMTPPort:    getEnv("SMTP_PORT", "587"),
		SMTPUser:    getEnv("SMTP_USER", ""),
		SMTPPass:    getEnv("SMTP_PASS", ""),
		SenderEmail: getEnv("SENDER_EMAIL", ""),
		JWTSecret:   getEnv("JWT_SECRET", "secret"),
		Port:        getEnv("PORT", "8080"),
	}
}

// readEnvFile reads the .env file line by line
func readEnvFile(filename string) {
	file, err := os.Open(filename)
	if err != nil {
		return // no .env file found, use defaults
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()

		// Skip empty lines and comments
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Split KEY=VALUE
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])
			os.Setenv(key, value)
		}
	}
}

// getEnv gets a value from environment or returns default
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
