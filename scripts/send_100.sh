for i in {1..1000}
do
  echo "MSG:tung:$i"  | nc localhost 9000 > /dev/null
done
