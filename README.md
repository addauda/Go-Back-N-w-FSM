# Go-Back-N protocol implementation with State Machine

## How to run program
- Instal dependencies with `npm install`
- Modify ports and host IP variables in **client**, **sender** and **emu** shell scripts
- Run shell scripts in the following order: `emu.sh` --> `receiver.sh` --> `sender.sh`
- You should see the relevant log files generated and FSM state output in the cli

## Tested Environments
-  Tested on `ubuntu1804-008` as both sender, emulator and receiver: PASSED
-  Tested on `ubuntu1804-004` as client and `ubuntu1804-008` as server: PASSED
