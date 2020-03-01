# Go-Back-N protocol implementation with State Machine

## How to run program
- Instal dependencies with `npm install`
- Modify ports and host IP variables in **client**, **sender** and **emu** shell scripts
- Run shell scripts in the following order: `emu.sh` --> `receiver.sh` --> `sender.sh`
- You should see your relevant log files generated and log lines in the cli that echo the state of FSM

## Tested Environments
-  Tested on `ubuntu1804-008` as both client and server: PASSED
-  Tested on `ubuntu1804-004` as client and `ubuntu1804-008` as server: PASSED