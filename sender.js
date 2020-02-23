const fs = require('fs');
const packet = require('./packet');
const udp = require('dgram');
const client = udp.createSocket('udp4');

//retrieve cli params
const emulator_address = process.argv[2];
const emulator_port = process.argv[3];
const sender_port = process.argv[4];
const file_name = process.argv[5];

//throw error if cli null or empty
if (!emulator_address || !emulator_port || !sender_port || !file_name) {
	throw "Missing a required CLI param";
}


const gbn = (file_name) => {

	let window_size = 0;

	const read_file = (file_name) => {

	};

};


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
