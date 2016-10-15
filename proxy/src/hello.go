package main

import (
  "fmt"
  "bufio"
  "os"
)

func main() {
    fmt.Printf("hello, world\n")
    reader := bufio.NewReader(os.Stdin)
    fmt.Println("Enter username: ")
    text, _ := reader.ReadString('\n')
    fmt.Print("welcome, " + text)

    sum := 1;
    for sum < 10 {
      text, _ := reader.ReadString('\n')
      fmt.Print(text)
    }
}
