// common packet class used by both SENDER and RECEIVER

class Packet {

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

	getUDPData() {
		let buffer = Buffer.alloc(512);
		buffer.writeInt32BE(this.type, 0);
		buffer.writeInt32BE(this.seqNum, 4);
		buffer.writeInt32BE(this.strData.length, 8);
		buffer.write(this.strData, 12, this.strData.length, "utf-8");
		return buffer;
	}

	static parseUDPdata(buffer) {
		let type = buffer.readInt32(0);
		let seqNum = buffer.readInt32(4);
		let length = buffer.readInt32(8);
		let strData = buffer.toString("utf-8", 12);
		return new Packet(type, seqNum, strData);
	}

	toString(){
		return `${this.type} ${this.seqNum} ${this.strData} ${this.getLength}`;
	}
}

Packet.maxDataLength = 500;
Packet.seqNumModulo = 32;

module.exports = Packet;