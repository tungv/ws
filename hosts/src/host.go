package main

import (
    "fmt"
    "net"
    "os"
    "bufio"
    "strings"
    "encoding/json"
)

const (
    CONN_HOST = "localhost"
    CONN_PORT = "3333"
    CONN_TYPE = "tcp"
)

func main() {
    // Listen for incoming connections.
    l, err := net.Listen(CONN_TYPE, CONN_HOST+":"+CONN_PORT)
    if err != nil {
        fmt.Println("Error listening:", err.Error())
        os.Exit(1)
    }
    // Close the listener when the application closes.
    defer l.Close()
    fmt.Println("Listening on " + CONN_HOST + ":" + CONN_PORT)
    messages := make(chan string)

    for {
        // Listen for an incoming connection.
        conn, err := l.Accept()
        if err != nil {
            fmt.Println("Error accepting: ", err.Error())
            os.Exit(1)
        }
        // Handle connections in a new goroutine.
        go handleRequest(conn, messages)
    }
}

func TrimSuffix(s, suffix string) string {
    if strings.HasSuffix(s, suffix) {
        s = s[:len(s)-len(suffix)]
    }
    return s
}

// Handles incoming requests.
func handleRequest(conn net.Conn, messages chan string) {
  // Read the incoming connection into the buffer.
  reader := bufio.NewReader(conn)
  command, _ := reader.ReadString(':')
  params, _ := reader.ReadString('\n')

  command = TrimSuffix(string(command), ":")
  params = TrimSuffix(string(params), "\n")

  fmt.Println(command)
  fmt.Println(params)

  switch command {
  case "subscribe":
    handleSubscription(params, conn, messages)
  case "send":
    handleSend(params, conn, messages)
  }
}

func toObject(byt []byte) {

}

func handleSubscription(params string, conn net.Conn, messages <-chan string) {
  topic := params
  conn.Write([]byte("Subscription started\n"))
  for {
    message := <- messages
    byt := []byte(message + "\n")
    var dat map[string]interface{}

    if err := json.Unmarshal(byt, &dat); err != nil {
      panic(err)
    }

    destination := dat["to"].(string)
    if destination == topic {
      conn.Write(byt)
    }
  }
}

func handleSend(params string, conn net.Conn, messages chan<- string) {
  conn.Write([]byte("Messages sent\n"))
  messages <- params
  // Close the connection when you're done with it.
  conn.Close()
}
