//iosSucksProcessorNode by rhy3756547
//---------------
//because apple apparently think the scriptProcessorNode isn't useful or feasable on iOS
//this is only a simple version

iosSucksProcessorNode = function(context, sampleSize, outputChannels) { //doesn't support input because that's not possible w/o ScriptProcessorNode
	var	startTime = context.currentTime;
	var internalGainNode = context.createGainNode();
	alert(internalGainNode.gain.value)
	var sampleRate = context.sampleRate;
	var timePerChunk = sampleSize/sampleRate
	var chunksRendered = 2; //a little bit of latency
	this.connect = function(destination) { internalGainNode.connect(destination) };
	var node = this
	var nextTime = (Math.floor(context.currentTime/timePerChunk)+1)*timePerChunk;
	var sampleHandler = function() {
		if (typeof node.onaudioprocess != "undefined") {
			var soundBuf = new Float32Array(sampleSize);
			var object = {outputBuffer: {getChannelData: function(channel){return soundBuf}}, currentTarget: node};
			node.onaudioprocess(object);
			var buffer = context.createBuffer(encodeAudio16bitByteArray(soundBuf, sampleRate), false) // this is really slow but as far as I can tell iOS doesn't support creating an empty buffer then editing it.
			var src = context.createBufferSource()
			src.buffer = buffer;
			src.connect(internalGainNode);
			if (nextTime < context.currentTime) nextTime = (Math.floor(context.currentTime/timePerChunk)+1)*timePerChunk;
			src.noteOn(nextTime);
			nextTime += timePerChunk; 
		}
	}
	setInterval(sampleHandler, (timePerChunk)*1000);
}

function encodeAudio16bitByteArray(data, sampleRate) {

	var n = data.length;
	var soundBuf = new ArrayBuffer(44+n*2);
	var header = "RIFF<##>WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00<##><##>\x02\x00\x10\x00data<##>";
		function insertLong(value) {
			var bytes = "";
			for (i = 0; i < 4; ++i) {
			bytes += String.fromCharCode(value % 256);
			value = Math.floor(value / 256);
		}
		header = header.replace('<##>', bytes);
	}

	// ChunkSize
	insertLong(36 + n * 2);
      
	// SampleRate
	insertLong(sampleRate);

	// ByteRate
	insertLong(sampleRate * 2);

	// Subchunk2Size
	insertLong(n * 2);
      
      // Output sound data
	var bytes = new Uint8Array(soundBuf, 0, 44);
	for (var i = 0; i < header.length; i++) {
		bytes[i] = header.charCodeAt(i);
	}
	var audio = new Uint16Array(soundBuf, 44, data.length)
	var temp
	for (var i = 0; i < data.length; i++) {
		temp = Math.round(data[i]*32767.5)
		if (temp<0) temp += 65536;
		audio[i] = temp;
	}
	return soundBuf;
}