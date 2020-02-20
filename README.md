# CS656_A1

## How to run program
- Run server.sh with integer request code as a cli param e.g `./server.sh 18`. You should see negotiation port number in terminal.
- Run client.sh with server address, negotiation port number, integer request code, and a message as a cli params e.g `./client.sh 192.168.1.6 49547 18 "Hello Bob"`
- You should see your message reversed one the last line of output

## Tested Environments
-  Tested on `ubuntu1804-008` as both client and server: PASSED
-  Tested on `ubuntu1804-004` as client and `ubuntu1804-008` as server: PASSED