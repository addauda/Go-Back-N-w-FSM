const fs = require("fs");
const Packet = require("./packet");
const client = require("dgram").createSocket("udp4");
const createLogger = require("./logger");

//logger constats
const arvLogFileName = "arrival.log";

// Create the loggers
const arvLogger = createLogger(arvLogFileName);

//retrieve cli params
const _emuAddress = process.argv[2];
const _emuPort = process.argv[3];
const _rcvPort = process.argv[4];
const _fileName = process.argv[5];

//throw error if cli null or empty
if (!_emuAddress || !_emuPort || !_rcvPort || !_fileName) {
  throw "Missing a required CLI param";
}

let packets = [];
//gbn counters
let _nextSeqNum = 0;
let _lastSeqNum = 0;

//send packet to emulator
const sndPacketToEmu = packet => {
  let buffer = packet.getUDPData();

  //send buffer and log sequence number
  client.send(buffer, _emuPort, _emuAddress, err => {
    err && client.close();
  });
};

const packetsToFile = fileName => {
  //open output file in append mode
  let writer = fs.createWriteStream(fileName, { flags: "a" });

  //loop through packets and get string content
  packets.forEach(packet => {
    writer.write(packet.strData);
  });

  //close write
  writer.end();
};

//event handler for any udp data received
client.on("message", buffer => {
  //parse buffer -> packet
  let packet = Packet.parseUDPdata(buffer);

  //log sqeuence number of packet
  arvLogger.info(packet.seqNum);

  switch (packet.type) {
    //handle data packets
    case Packet.type.DATA:
      packets[packet.seqNum] = packet;
      //sequence number from packet is what was expected
      if (_nextSeqNum === packet.seqNum) {
        //create and send ACK for received packet
        let ackPacket = Packet.createACK(packet.seqNum);
        sndPacketToEmu(ackPacket);
        //update gbn counters
        _lastSeqNum = _nextSeqNum;
        _nextSeqNum += 1;
      }
      //sequence number from packet is not what was expected
      else {
        //create and send ACK for last acknowledged packet
        let ackPacket = Packet.createACK(_lastSeqNum);
        sndPacketToEmu(ackPacket);
        //update gbn counters
        _nextSeqNum = _lastSeqNum;
      }
      break;
    //handle EOT packets
    case Packet.type.EOT:
      //create and send ACK for EOT
      let eotPacket = Packet.createEOT(packet.seqNum);
      sndPacketToEmu(eotPacket);
      packetsToFile(_fileName); //write packet data to file
      break;
  }
});

//start listening at specified port
client.bind(_rcvPort);
