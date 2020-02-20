const net = require('net');
const udp = require('dgram');

//retrieve cli params
let raw_server_address = process.argv[2];
let raw_n_port = process.argv[3];
let raw_req_code = process.argv[4];
let raw_message = process.argv[5];

//throw error if cli null or empty
if (!raw_server_address || !raw_n_port || !raw_req_code || !raw_message) {
	throw "Missing a required CLI param";
}

//parse cli param
let server_address = (typeof(raw_server_address) === "string") && raw_server_address;
let n_port = parseInt(raw_n_port);
let req_code = parseInt(raw_req_code);
let message = (typeof(raw_message) === "string") && raw_message;

//throw error if cli param is in a wrong format
if (!server_address || !n_port || !req_code || !message) {
	throw "Invalid format for a CLI param";
}

//TCP negotiation function
const negotiate = (server_address, n_port, req_code, callback) => {
	const client = new net.Socket();

	//connect to TCP server
	client.connect(n_port, server_address, function() {
		console.log(`Connected to server:${server_address} at port:${n_port}`);
	});

	//event handler for when client receives message
	client.on('data', function(data) {
		console.log(`Received:${data}`);

		//parse data to Integer as port
		let r_port = parseInt(data);
		
		//if port is successfully parsed, pass port to callback then disconnect TCP client
		(r_port) && (callback) && callback(r_port); client.destroy();
	});

	//send request code to TCP server
	client.write(req_code.toString());
}

//UDP transmission function - passed as callback parameter to negotiation
const transmit = (r_port) => {
	const client = udp.createSocket('udp4');

	//create buffer from cli message
	const buffer = Buffer.from(message);

	//send message to received port
	client.send(buffer, r_port, server_address, (err) => {
		(err) ? client.close()
			: console.log(`Sent buffer:'${buffer.toString()}' to server:${server_address} at port:${r_port}`);
	});

	//event handler for when client receives message
	client.on('message', (msg, rinfo) => {
		console.log(`${msg.toString()}\n`);
	});
}

//Begin program with negotiation phase
negotiate(server_address, n_port, req_code, transmit);