// common packet class used by both SENDER and RECEIVER

const maxDataLength = 500;
const seqNumModulo = 32;

class packet {

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

	get getType() {
		return this.type;
	}

	get getSeqNum() {
		return this.seqNum;
	}

	get getLength() {
		return this.strData.length;
	}

	get getData() {
		return [...Buffer.from(this.data)];
	}

	getUDPData() {
		let buffer = Buffer.alloc(512);
		buffer.writeInt8(this.type, 0);
		buffer.writeInt8(this.seqNum, 4);
		buffer.writeInt8(this.strData.length, 8);
		buffer.write(this.strData, 12, this.strData.length, "utf-8");
		return buffer;
	}

	parseUDPdata(buffer) {
		let type = buffer.readInt8(0);
		let seqNum = buffer.readInt8(4);
		let length = buffer.readInt8(8);
		let strData = buffer.toString("utf-8", 12);
		return new packet(type, seqNum, strData);
	}
}

module.exports.packet = packet;