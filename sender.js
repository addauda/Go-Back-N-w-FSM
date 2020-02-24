const fs = require('fs');
const Packet = require('./packet');
const client = require('dgram').createSocket('udp4');

//retrieve cli params
const _emuAddress = process.argv[2];
const _emuPort = process.argv[3];
const _sndPort = process.argv[4];
const _fileName = process.argv[5];

//throw error if cli null or empty
if (!_emuAddress || !_emuPort || !_sndPort || !_fileName) {
	throw "Missing a required CLI param";
}

const _windowSize = 10;

const fileToPackets = (fileName) => {

	let buffer = fs.readFileSync(fileName);

	if (buffer.length <= Packet.maxDataLength) {
		return [Packet.createPacket(1, buffer.toString("utf-8", 0))];
	}

	let packets = []
	let numPackets = Math.ceil(buffer.length / Packet.maxDataLength);
	let seqCount = 1;
	let startIndex = 0;

	while (packets.length !== numPackets) {
		let nextChunk = (seqCount * Packet.maxDataLength) ;
		let endIndex = (nextChunk > buffer.length) ? buffer.length : nextChunk;
		packets.push(Packet.createPacket(seqCount, buffer.toString("utf-8", startIndex, endIndex)));
		startIndex = endIndex++;
		seqCount++;
	}

	return packets;
};

const _packets = fileToPackets(_fileName);

// server_address = "10.0.2.15";
// server_port = 9992;

// let str = "hello";

// //create buffer from cli message
// let buffer = Buffer.alloc(512);
// buffer.writeInt8(22, 0);
// buffer.writeInt8(66, 4);
// buffer.writeInt8(88, 8);
// buffer.write(str, 12, str.length, "utf-8");

// console.log(buffer);
// //send message to received port
// client.send(buffer, server_port, server_address, (err) => {
// 	(err) ? client.close()
// 		: console.log(`Sent buffer:'${buffer.toString()}' to server:${server_address} at port:${server_port}`);
// });
