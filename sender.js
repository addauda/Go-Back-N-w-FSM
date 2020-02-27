const fs = require("fs");
const Packet = require("./packet");
const client = require("dgram").createSocket("udp4");
const machina = require("machina");
const createLogger = require("./logger");

//logger constats
const ackLogFileName = "ack.log";
const seqLogFileName = "seqnum.log";

// Create the loggers
const ackLogger = createLogger(ackLogFileName);
const seqNumLogger = createLogger(seqLogFileName);

//retrieve cli params
const _emuAddress = process.argv[2];
const _emuPort = process.argv[3];
const _sndPort = process.argv[4];
const _fileName = process.argv[5];

//throw error if cli null or empty
if (!_emuAddress || !_emuPort || !_sndPort || !_fileName) {
  throw "Missing a required CLI param";
}

//chunks files into N packets
const fileToPackets = fileName => {
  // create buffer from file contents
  let buffer = fs.readFileSync(fileName);

  //buffer content can fit into a single packet
  if (buffer.length <= Packet.maxDataLength) {
    return [Packet.createPacket(1, buffer.toString("utf-8", 0))];
  }

  //chunk logic counters
  let packets = [];
  let numPackets = Math.ceil(buffer.length / Packet.maxDataLength);
  let seqCount = 1;
  let startIndex = 0;

  //loop until number of packets created
  while (packets.length !== numPackets) {
    let nextChunk = seqCount * Packet.maxDataLength;
    let endIndex = nextChunk > buffer.length ? buffer.length : nextChunk;
    packets.push(
      Packet.createPacket(
        seqCount - 1,
        buffer.toString("utf-8", startIndex, endIndex)
      )
    );
    startIndex = endIndex++;
    seqCount++;
  }

  return packets;
};

//parse packets from emu
const rcvPacketFromEmu = buffer => {
  //create packet from buffer
  let packet = Packet.parseUDPdata(buffer);

  //process only ACK + EOT
  if (packet.type === Packet.type.ACK || packet.type === Packet.type.EOT) {
    //log ACK sequence number
    if (packet.type === Packet.type.ACK) {
      ackLogger.info(packet.seqNum);
    }
    sndViaGBN._ackReceived(packet.type, packet.seqNum);
  }
};

//set event handler for messages from emulator
client.on("message", rcvPacketFromEmu);

//start listening on specified port
client.bind(_sndPort);



//send packets to emu
const sndPacketToEmu = packet => {
  let buffer = packet.getUDPData();

  //send buffer and log sequence number
  client.send(buffer, _emuPort, _emuAddress, err => {
    err ? client.close() : seqNumLogger.info(packet.seqNum);
  });
};

const _ackTimeout = 4000;

//gbn state machine
const sndViaGBN = new machina.Fsm({
  namespace: "a2-gbn",
  _windowSize: 10,
  _packets: null,
  _numPacketsInFlight: 0,
  _lastSeqNum: 0,
  _lastAckRecv: 0,
  _eotSeqNum: 0,
  _ackTimer: null,
  initialState: "ENQUEUE",
  states: {
    //in this state - get packets ready for transmission i.e chunking
    ENQUEUE: {
      _onEnter: function() {
        this._packets = fileToPackets(_fileName);
        this.transition("TRANSMIT_PACKETS");
      }
    },
    //in this state - transmit packets based on window size constraints and sequence numbers
    TRANSMIT_PACKETS: {
      _onEnter: function() {
        // if window is not full
        if (
          this._numPacketsInFlight < this._windowSize &&
          this._lastAckRecv < this._packets.length
        ) {
          let packetsToSend = this._windowSize - this._numPacketsInFlight;

          //send packets starting from last sequence number ack'ed
          for (
            let count = 0, seqNum = this._lastSeqNum;
            count <= packetsToSend && seqNum < this._packets.length;
            count++, ++seqNum
          ) {
            let dataPacket = this._packets[seqNum];
            sndPacketToEmu(dataPacket);
            this._lastSeqNum = seqNum;
          }
          //start timer after send
          this._ackTimer = setTimeout(
            function() {
              this.transition("RESET");
            }.bind(this),
            _ackTimeout
          );
        } else {
          this.transition("WAIT");
        }
      }
    },
    //in this state - reset gbn counters, timers, and transition to transmit state
    RESET: {
      _onEnter: function() {
        clearTimeout(this._ackTimer);
        this._lastSeqNum = this._lastAckRecv;
        this._numPacketsInFlight = 0;
        this.transition("TRANSMIT_PACKETS");
      }
    },

    //in this state - wait for a specified time then transition to transmit state
    WAIT: {
      _onEnter: function() {
        setTimeout(
          function() {
            this.transition("TRANSMIT_PACKETS");
          }.bind(this),
          _ackTimeout
        );
      }
    },

    //in this state - process acks we've received
    ACK_RECEIVED: {
      _onEnter: function(ackType, ackSeqNum) {
        switch (ackType) {
          case Packet.type.ACK:
            this._numPacketsInFlight = this._lastSeqNum - ackSeqNum;
            this._lastAckRecv = ackSeqNum;

            //there are outstanding packets in flight
            if (ackSeqNum < this._lastSeqNum) {
              //start a new timer, and on timeout transition to reset state
              clearTimeout(this._ackTimer);
              this._ackTimer = setTimeout(
                function() {
                  this.transition("RESET");
                }.bind(this),
                _ackTimeout
              );
            } else {
              //no outstanding packets left to be ack'ed
              clearTimeout(this._ackTimer);
              this.transition("END_TRANSMISSION");
            }
            break;
          case Packet.type.EOT:
            //transition to finish
            if (ackSeqNum === this._lastSeqNum) {
              this.transition("FINISH");
            }
            break;
        }
      }
    },

    //in this state - send EOT packet
    END_TRANSMISSION: {
      _onEnter: function() {
        let eotPacket = Packet.createEOT(this._lastSeqNum);
        sndPacketToEmu(eotPacket);
      }
    },

    //in this state - cleanup client and exit
    FINISH: {
      _onEnter: function() {
        client.close();
        console.log("The END");
      }
    }
  },

  //external interface into state machine
  _initFSM: function() {
    this.transition("ENQUEUE");
  },

  //external interface into state machine
  _ackReceived: function(ackType, ackSeqNum) {
    this.transition("ACK_RECEIVED", ackType, ackSeqNum);
  }
});

//transition to initial state on FSM
sndViaGBN._initFSM();
