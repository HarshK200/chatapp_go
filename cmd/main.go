package main

import (
	"log"
	"net/http"
)

func main() {
	wsManager := NewManager()

	mux := http.NewServeMux()

	// handler
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.RequestURI != "/" {
			http.Error(w, "404 not found", http.StatusNotFound)
			return
		}
		w.Write([]byte("Hello there this is the root page"))
	})

	// NOTE: accepts websocket connections here
	mux.HandleFunc("/ws", wsManager.serveWS)

	// fileServer := http.FileServer(http.Dir("./web/"))
	// mux.Handle("/chat/", http.StripPrefix("/chat", fileServer))

	server := http.Server{
		Addr:    ":4000",
		Handler: mux,
	}

	log.Printf("server listening on port 4000...")
	log.Fatal(server.ListenAndServe())
}
