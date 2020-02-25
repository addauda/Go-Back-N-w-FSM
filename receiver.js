const fs = require('fs');
const Packet = require('./packet');
const client = require('dgram').createSocket('udp4');

//retrieve cli params
const _emuAddress = process.argv[2];
const _emuPort = process.argv[3];
const _rcvPort = process.argv[4];
const _fileName = process.argv[5];

//throw error if cli null or empty
if (!_emuAddress || !_emuPort || !_rcvPort || !_fileName) {
	throw "Missing a required CLI param";
}

client.on('message', (buffer) => {
    let packet = Packet.parseUDPdata(buffer);
    console.log(packet.toString());
});

client.bind(_rcvPort);

// const sendACKPacketToEmu = (buffer) => {
// 	client.send(buffer, _emuPort, _emuAddress, (err) => {
// 		(err) ? client.close()
// 			: console.log(`Sent buffer ${buffer.byteLength}`);
// 	});
// }

// //event handler for server error
// server.on('error', (err) => {
//     console.log(`server error:\n${err.stack}`);
//     server.close();
// });

// //event handler for when server receives message
// //reverses data and sends back on socket
// server.on('message', (buffer, rinfo) => {
//     console.log(buffer.readInt8(0));
//     console.log(buffer.readInt8(4));
//     console.log(buffer.readInt8(8));
//     console.log(buffer.toString("utf-8", 12));
//     //console.log(`${msg.toString()}`, rinfo.port, rinfo.address);
// });

// //binds server to any available port and all network interfaces on host
// server.bind(9994);