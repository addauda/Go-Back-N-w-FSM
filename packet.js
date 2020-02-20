// common packet class used by both SENDER and RECEIVER

class packet {

	maxDataLength = 500;
	seqNumModulo = 32;

	constructor(type, seqNum, strData) {

		if (strData.length > maxDataLength) {
			throw new Error(`data too large (max is ${maxDataLength} chars)`);
		}

		this.type = type;
		this.seqNum = seqNum;
		this.strData = strData;
	}

	static createACK(seqNum) {
		return new packet(0, seqNum, new String());
	}
	
	static createPacket(seqNum, data) {
		return new packet(1, seqNum, data);
	}
	
	static createEOT(seqNum) {
		return new packet(2, seqNum, new String());
	}

	get type() {
		return this.type;
	}

	get seqNum() {
		return this.seqNum;
	}

	get length() {
		return this.strData.length;
	}

	get data() {
		return [...Buffer.from(this.data)];
	}

	getUDPData() {
		let buffer = new Buffer.alloc(512);
		buffer.writeInt8(this.type);
		buffer.writeInt8(this.seqNum);
		buffer.writeInt8(this.strData.length);
		buffer.write(Buffer.from(this.strData, 0,this.strData.length()));
		return buffer;
	}

	parseUDPdata(UDPdata) {
		console.log(UDPdata);
		// let buffer = [...Buffer.from(UDPdata)];
		// let type = buffer.;
		// let seqNum = buffer.getInt();
		// let length = buffer.getInt();
		// byte data[] = new byte[length];
		// buffer.get(data, 0, length);
		// return new packet(type, seqnum, new String(data));
	}
}

module.exports.packet = packet;