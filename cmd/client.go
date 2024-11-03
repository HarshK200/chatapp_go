package main

import (
	"log"

	"github.com/gorilla/websocket"
)

// NOTE: holds all the conncted clients
type ClientList map[*Client]bool

// NOTE: a connected client and it's connection
type Client struct {
	connection *websocket.Conn
	manager    *Manager
	egress     chan []byte
}

func NewClient(conn *websocket.Conn, manager *Manager) *Client {
	return &Client{
		connection: conn,
		manager:    manager,
		egress:     make(chan []byte),
	}
}

func (c *Client) readMessage() {
	defer func() {
		// Graceful Close the Connection once this function is done
		c.manager.removeClient(c)
	}()

	// NOTE: loop forever
	for {
		messageType, payload, err := c.connection.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err) {
				log.Printf("error reading message: %v", err)
			}
			break // break to loop to close connection and cleanup
		}

		log.Printf("MessageType: %v", messageType)
		log.Printf("Payload: %v", string(payload))

		// HACK: to test that writeMessage works as intended (broadcasting the message recieved to all the clients)
		// will be replaced soon
		for wsclient := range c.manager.clients {
			wsclient.egress <- payload
		}
	}
}

func (c *Client) writeMessage() {
	defer func() {
		c.manager.removeClient(c)
	}()

	// NOTE: infinite loop
	for {
		select {
		case message, ok := <-c.egress:
			// ok is false when the egress channel is closed
			if !ok {
				if err := c.connection.WriteMessage(websocket.CloseMessage, nil); err != nil {
					log.Println("connection close: ", err)
				}

				// returning to close this goroutine
				return
			}

			if err := c.connection.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Println(err)
			}
			log.Println("message sent")
		}
	}
}
