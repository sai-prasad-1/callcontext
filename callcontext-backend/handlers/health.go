package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type HealthResponse struct {
	Status  string `json:"status"`
	Version string `json:"version"`
	Service string `json:"service"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

// Health returns a 200 OK response with service status
// Used by Railway and monitoring tools
func Health(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:  "ok",
		Version: "1.0.0",
		Service: "callcontext-backend",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// NotImplemented returns a 501 Not Implemented response
// Used for placeholder endpoints during development
func NotImplemented(endpoint string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := ErrorResponse{
			Error: fmt.Sprintf("Endpoint %s not yet implemented", endpoint),
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotImplemented)
		json.NewEncoder(w).Encode(response)
	}
}
