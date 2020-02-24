// common packet class used by both SENDER and RECEIVER

// const maxDataLength = 500;
// const seqNumModulo = 32;

class Packet {

	// static maxDataLength = 500;
	// static seqNumModulo = 32;

	constructor(type, seqNum, strData) {

		if (strData.length > Packet.maxDataLength) {
			throw new Error(`data too large - you have ${strData.length} | max is ${Packet.maxDataLength} chars`);
		}

		this.type = type;
		this.seqNum = seqNum;
		this.strData = strData;
	}

	static createACK(seqNum) {
		return new Packet(0, seqNum, new String());
	}
	
	static createPacket(seqNum, data) {
		return new Packet(1, seqNum, data);
	}
	
	static createEOT(seqNum) {
		return new Packet(2, seqNum, new String());
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

	toString(){
		return `${this.type} ${this.seqNum} ${this.strData} ${this.getLength}`;
	}
}

Packet.maxDataLength = 500;
Packet.seqNumModulo = 32;

module.exports = Packet;