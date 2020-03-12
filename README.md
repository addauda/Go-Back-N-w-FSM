# Go-Back-N protocol implementation with State Machine

## How to run program
- Install dependencies with `npm install`
- Run shell scripts in the following order:
  - `emu.sh <command line arguments>` 
  - `receiver.sh <command line arguments>`
  - `sender.sh <command line arguments>`

  If no parameters are specified, then default variables are used.
- You should see the relevant log files generated and FSM state output in the cli
- Ack timeout for sender can be set on the State machine GBN constants (Line in `95` sender.js) - Default is 300ms

## Tested Environments
-  Tested on `ubuntu1804-008` as both sender, emulator and receiver: PASSED
-  Tested on `ubuntu1804-002` as sender, `ubuntu1804-004` as emulator, and `ubuntu1804-008` as receiver: PASSED
