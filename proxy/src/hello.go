package main

import (
  "fmt"
  "bufio"
  "net"
  "os"
)

func main() {
    fmt.Printf("hello, world\n")
    reader := bufio.NewReader(os.Stdin)
    topic, _ := reader.ReadString('\n')
    fmt.Print("subscribing: " + topic)

    conn, _ := net.Dial("tcp", "127.0.0.1:9000")
    fmt.Fprintf(conn, "SUB:" + topic)

    responseReader := bufio.NewReader(conn)

    for {
      message, _ := responseReader.ReadString('\n')
      fmt.Print(message)
    }

}
