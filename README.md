# Go-Back-N protocol implementation with State Machine

## How to run program
- Instal dependencies with `npm install`
- Modify ports and host IP variables in **client**, **sender** and **emu** shell scripts
- Run shell scripts in the following order: `emu.sh` --> `receiver.sh` --> `sender.sh`
- If you'd like to run the sender and receiver without shell scripts, you can pass the required cli parameters directly when you're running the files with node.
  e.g `node sender.js <command line arguments>`
- You should see the relevant log files generated and FSM state output in the cli
- Ack timeout for sender can be set on the State machine GBN constants (Line in `93` sender.js) - Default is 300ms

## Tested Environments
-  Tested on `ubuntu1804-008` as both sender, emulator and receiver: PASSED
-  Tested on `ubuntu1804-002` as sender, `ubuntu1804-004` as emulator, and `ubuntu1804-008` as receiver: PASSED
