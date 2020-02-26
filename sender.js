const fs = require('fs');
const Packet = require('./packet');
const client = require('dgram').createSocket('udp4');
const machina = require('machina');

//retrieve cli params
const _emuAddress = process.argv[2];
const _emuPort = process.argv[3];
const _sndPort = process.argv[4];
const _fileName = process.argv[5];
const _ackTimeout = 4000;

//throw error if cli null or empty
if (!_emuAddress || !_emuPort || !_sndPort || !_fileName) {
	throw "Missing a required CLI param";
}

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
		let nextChunk = (seqCount * Packet.maxDataLength);
		let endIndex = (nextChunk > buffer.length) ? buffer.length : nextChunk;
		packets.push(Packet.createPacket((seqCount - 1), buffer.toString("utf-8", startIndex, endIndex)));
		startIndex = endIndex++;
		seqCount++;
	}

	return packets;
};

client.on('message', (buffer) => {

	//create packet from buffer
	let packet = Packet.parseUDPdata(buffer);

	//process only ACK + EOT
	(packet.type === Packet.type.ACK || packet.type === Packet.type.EOT) &&
		console.log(packet.type, packet.seqNum)
		sndViaGBN._ackReceived(packet.type, packet.seqNum);
	
});

client.bind(_sndPort);

const sendPacketToEmu = (buffer) => {
	client.send(buffer, _emuPort, _emuAddress, (err) => {
		(err) ? client.close()
			: console.log('');
	});
}

const sndViaGBN = new machina.Fsm( {
	namespace: "a2-gbn",
	_windowSize: 10,
	_packets: null,
	_numPacketsInFlight: 0,
	_lastSeqNum: 0,
	_lastAckRecv: 0,
	_eotSeqNum: 0,
	_ackTimer: null,
    initialState: "ENQUEUE",
    states: {
        ENQUEUE: {
            "ENQUEUE": function() {
				this._packets = fileToPackets(_fileName);
                this.transition("TRANSMIT_PACKETS");
            }
		},
		
        TRANSMIT_PACKETS: {
            _onEnter: function() {

				if (this._numPacketsInFlight < this._windowSize && this._lastAckRecv < this._packets.length) 
				{
					let packetsToSend = this._windowSize - this._numPacketsInFlight;

					for(let count = 0, seqNum = this._lastSeqNum; count <= packetsToSend && seqNum < this._packets.length; count++, ++seqNum) {
						let dataPacket = this._packets[seqNum];
						sendPacketToEmu(dataPacket.getUDPData());
						this._lastSeqNum = seqNum;
					}

					this._ackTimer = setTimeout(function() {
						this.transition("RESET");
					}.bind(this), _ackTimeout);
					
				} else {
					this.transition("WAIT");
				}
			},
		},
		
		RESET: {
            _onEnter: function() {
				clearTimeout(this._ackTimer);
				this._lastSeqNum = this._lastAckRecv;
				this._numPacketsInFlight = 0;
				this.transition('TRANSMIT_PACKETS');
			},
		},

		WAIT: {
            _onEnter: function() {
				setTimeout(function() {
					this.transition("TRANSMIT_PACKETS");
				}.bind(this), _ackTimeout);
			},
		},

		ACK_RECEIVED: {
			_onEnter: function(ackType, ackSeqNum) {

				switch (ackType) {
					case Packet.type.ACK:
						this._numPacketsInFlight = this._lastSeqNum - ackSeqNum;
						this._lastAckRecv = ackSeqNum;
						console.log(`Expected:${this._lastSeqNum} Received;${ackSeqNum}`)
						if(ackSeqNum < this._lastSeqNum) { //packets are still in flight
							console.log(`Waiting for ${this._numPacketsInFlight} in flight`)
							clearTimeout(this._ackTimer);
							this._ackTimer = setTimeout(function() {
								this.transition("RESET");
							}.bind(this), _ackTimeout);
						} else {
							console.log(1)
							clearTimeout(this._ackTimer);
							this.transition("END_TRANSMISSION");
						}
						break;
					case Packet.type.EOT:
						if (ackSeqNum === this._lastSeqNum) {
							this.transition('FINISH');
						}
						break;
				}
			},
		},

		END_TRANSMISSION: {
            _onEnter: function() {
				let eotPacket = Packet.createEOT(this._lastSeqNum);
				sendPacketToEmu(eotPacket.getUDPData());
			},
		},

		FINISH: {
            _onEnter: function() {
				client.close();
				console.log('The END');
			},
		},
    },

    _initFSM: function() {
        this.handle("ENQUEUE");
	},
	
	_ackReceived: function(ackType, ackSeqNum) {
		this.transition("ACK_RECEIVED", ackType, ackSeqNum);
    }
} );

sndViaGBN._initFSM();
