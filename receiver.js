const fs = require("fs");
const Packet = require("./packet");
const client = require("dgram").createSocket("udp4");

//retrieve cli params
const _emuAddress = process.argv[2];
const _emuPort = process.argv[3];
const _rcvPort = process.argv[4];
const _fileName = process.argv[5];

//throw error if cli null or empty
if (!_emuAddress || !_emuPort || !_rcvPort || !_fileName) {
  throw "Missing a required CLI param";
}

//gbn counters
let _nextSeqNum = 0;
let _lastSeqNum = 0;

//send packet to emulator
const sendPacketToEmu = buffer => {
  client.send(buffer, _emuPort, _emuAddress, err => {
    err ? client.close() : console.log("");
  });
};

//event handler for any udp data received
client.on("message", buffer => {
  //parse buffer -> packet
  let packet = Packet.parseUDPdata(buffer);

  switch (packet.type) {
    //handle data packets
    case Packet.type.DATA:
      //sequence number from packet is what was expected
      if (_nextSeqNum === packet.seqNum) {
        //create and send ACK for received packet
        let ackPacket = Packet.createACK(packet.seqNum);
        sendPacketToEmu(ackPacket.getUDPData());
        //update gbn counters
        _lastSeqNum = _nextSeqNum;
        _nextSeqNum += 1;
      }
      //sequence number from packet is not what was expected
      else {
        //create and send ACK for last acknowledged packet
        let ackPacket = Packet.createACK(_lastSeqNum);
        sendPacketToEmu(ackPacket.getUDPData());
        //update gbn counters
        _nextSeqNum = _lastSeqNum;
      }
      break;
    //handle EOT packets
    case Packet.type.EOT:
      //create and send ACK for EOT
      let eotPacket = Packet.createEOT(packet.seqNum);
      sendPacketToEmu(eotPacket.getUDPData());
      //close client
      client.close();
      break;
  }
});

//start listening at specified
client.bind(_rcvPort);
