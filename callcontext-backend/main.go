package main

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"callcontext-backend/config"
	"callcontext-backend/handlers"
	"callcontext-backend/middleware"

	"github.com/go-chi/chi/v5"
)

func main() {
	// Initialize structured logging
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	slog.Info("🚀 CallContext Backend starting...")

	// Load configuration
	cfg := config.Load()

	// Initialize router
	r := chi.NewRouter()

	// CORS origins
	allowedOrigins := []string{
		"http://localhost:3000",
		"http://localhost:3001",
	}

	// Add production frontend URL if set
	if cfg.Environment == "production" {
		// Add your Vercel URL here
		allowedOrigins = append(allowedOrigins, "https://your-app.vercel.app")
	}

	// Global middleware
	r.Use(middleware.Recoverer)
	r.Use(middleware.Logger)
	r.Use(middleware.CORS(allowedOrigins))

	// Health check endpoint
	r.Get("/health", handlers.Health)

	// API routes
	r.Route("/api", func(r chi.Router) {
		// Universal telephony webhooks (provider-agnostic)
		r.Route("/telephony", func(r chi.Router) {
			r.Post("/answer", handlers.NotImplemented("telephony.answer"))
			r.Post("/status", handlers.NotImplemented("telephony.status"))
			r.Post("/recording", handlers.NotImplemented("telephony.recording"))
		})

		// WebSocket endpoints
		r.Route("/stream", func(r chi.Router) {
			r.Get("/audio", handlers.NotImplemented("stream.audio"))
			r.Get("/dashboard/{shopId}", handlers.NotImplemented("stream.dashboard"))
		})

		// Cron endpoints
		r.Route("/cron", func(r chi.Router) {
			r.Post("/daily-digest", handlers.NotImplemented("cron.daily-digest"))
		})
	})

	// Create server
	addr := fmt.Sprintf("0.0.0.0:%s", cfg.Port)
	srv := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		slog.Info("🌐 Server starting", "addr", addr, "environment", cfg.Environment)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ Server failed to start: %v", err)
		}
	}()

	slog.Info("✅ CallContext Backend is running")
	slog.Info("📍 Health check available at", "url", fmt.Sprintf("http://%s/health", addr))

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("🛑 Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("❌ Server forced to shutdown: %v", err)
	}

	slog.Info("✅ Server stopped gracefully")
}
