package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

var boats map[string]*Boat = map[string]*Boat{}

func handleCreateBoat(w http.ResponseWriter, r *http.Request) {
	var b = newBoat()

	boats[b.id] = b

	println("createt new boat with id " + b.id)

	w.WriteHeader(200)
	w.Header().Add("Content-Type", "application/text")
	w.Write([]byte(b.id))

	go b.run()

}

func handleConnectWS(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)

	id := vars["id"]

	boat := boats[id]

	if boat != nil {
		serveWs(boat, w, r)
	}

}

func handleListBoats(w http.ResponseWriter, r *http.Request) {

	var res = "["
	for k, v := range boats {

		res += fmt.Sprintf(`{"id": %v, "clientAmount": %v},`, k, len(v.clients))
	}
	res += "]"

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(200)
	w.Write([]byte(res))

}

func main() {

	r := mux.NewRouter()

	r.HandleFunc("/boats", handleListBoats)

	r.HandleFunc("/ws/{id}", handleConnectWS)

	r.HandleFunc("/boat", handleCreateBoat)

	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With"})
	originsOk := handlers.AllowedOrigins([]string{"chrome-extension://kemnlidlddhmnibdomgmkihieflaigdh"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	log.Fatal(http.ListenAndServe("localhost:8080", handlers.CORS(headersOk, originsOk, methodsOk)(r)))
}
