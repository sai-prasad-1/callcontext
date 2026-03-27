package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	// Server
	Port        string
	Environment string
	BaseURL     string

	// Supabase
	SupabaseURL        string
	SupabaseServiceKey string
	SupabaseAnonKey    string

	// AI Services
	DeepgramAPIKey string
	OpenAIAPIKey   string

	// Email
	ResendAPIKey string

	// Telephony Providers (for webhook verification only)
	TelnyxPublicKey  string
	TwilioAuthToken  string

	// Security
	WebhookSigningSecret string
	CronSecret           string
}

// Load reads environment variables and returns a Config
// Panics if required variables are missing
func Load() *Config {
	// Load .env file if it exists (development)
	_ = godotenv.Load()

	cfg := &Config{
		Port:        getEnv("PORT", "8080"),
		Environment: getEnv("ENVIRONMENT", "development"),
		BaseURL:     requireEnv("BASE_URL"),

		SupabaseURL:        requireEnv("SUPABASE_URL"),
		SupabaseServiceKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
		SupabaseAnonKey:    requireEnv("SUPABASE_ANON_KEY"),

		DeepgramAPIKey: requireEnv("DEEPGRAM_API_KEY"),
		OpenAIAPIKey:   requireEnv("OPENAI_API_KEY"),
		ResendAPIKey:   getEnv("RESEND_API_KEY", ""),

		TelnyxPublicKey: getEnv("TELNYX_PUBLIC_KEY", ""),
		TwilioAuthToken: getEnv("TWILIO_AUTH_TOKEN", ""),

		WebhookSigningSecret: getEnv("WEBHOOK_SIGNING_SECRET", "dev-secret"),
		CronSecret:           getEnv("CRON_SECRET", "dev-cron-secret"),
	}

	log.Printf("✅ Configuration loaded successfully")
	log.Printf("   Environment: %s", cfg.Environment)
	log.Printf("   Base URL: %s", cfg.BaseURL)
	log.Printf("   Port: %s", cfg.Port)

	return cfg
}

func requireEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		panic(fmt.Sprintf("❌ Required environment variable %s is not set", key))
	}
	return value
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
