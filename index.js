var recordmic = require( 'recordmic' );

var autorecordmic = function( settings, callback ) {

	if( !( this instanceof autorecordmic ) )
		return new autorecordmic( settings, callback );

	if( autorecordmic.isAvailable ) {

		var s = this.s = settings || {};
		s.averageDuration = s.averageDuration || 3000;
		s.recordStartLevel = s.recordStartLevel || 10;
		s.quietDuration = s.quietDuration || 1000;
		s.maxDuration = s.maxDuration || 6000;

		this.mic = recordmic( this.s, this.onMicInit.bind( this, callback ) );
	} else {

		callback( new Error( 'this browser is not supported' ) );
	}
};

autorecordmic.isAvailable = typeof AnalyserNode !== 'undefined';

autorecordmic.prototype = {

	listen: function() {
		this.isListening = true;
		this.mic.start();
	},

	stop: function() {
		this.reachedMaxSamples = true;
		this.isListening = false;
		this.isRecording = false;
		this.mic.stop();
	},

	onMicInit: function( callback, err ) {

		if( err ) {

			callback( err );
		}

		this.context = this.mic.context,
		this.audioInput = this.mic.audioInput;

		this.analyzer = this.context.createAnalyser();
		this.analyzer.fftSize = this.s.bufferSize;

		this.analyzerTicker = this.context.createScriptProcessor( this.s.bufferSize, 2, 2 );

		this.sampleTimeStart = Date.now();
		this.reachedMaxSamples = false;
		this.samples = [];

		window.automic_onaudioprocess = this.analyzerTicker.onaudioprocess = this.onAudioData.bind( this );

		this.audioInput.connect( this.analyzer );
		this.analyzer.connect( this.analyzerTicker );
		this.analyzerTicker.connect( this.context.destination );

		if( callback )
			callback( undefined, this );
	},

	onAudioData: function( ev ) {
		var data =  new Uint8Array( this.analyzer.frequencyBinCount ),
			avg = 0;

		this.analyzer.getByteFrequencyData( data );

		for( var i = 0, len = data.length; i < len; i++ ) {

			avg += data[ i ];
		}

		avg /= len;

		if( this.reachedMaxSamples || Date.now() - this.sampleTimeStart > this.s.averageDuration ) {

			if( !this.reachedMaxSamples ) {

				this.tAverage = 0;

				for( var i = 0, len = this.samples.length; i < len; i++ ) {

					this.tAverage += this.samples[ i ];
				}

				this.tAverage /= len;

				this.reachedMaxSamples = true;

				if( this.s.onSampleFinished )
					this.s.onSampleFinished();
			}


			if( this.isListening ) {

				//if the activity is higher than the average and startLevel then start recording audio
				if( avg > this.tAverage + this.s.recordStartLevel ) {

					if( !this.isRecording ) {

						this.recordingStartIndex = this.mic.getMonoData('left').length;
						this.isRecording = true;
						// this.mic.start();


						if( this.s.onRecordStart )
							this.s.onRecordStart();
					}

					this.silenceStartTime = undefined;
				//if we're recording then we should check for silence
				} else if( this.isRecording ) {

					if( this.silenceStartTime ) {
						var time = Date.now() - this.silenceStartTime 
						if( time > this.s.quietDuration || time > this.s.maxDuration ) {

							this.isListening = false;
							this.isRecording = false;
							this.mic.stop();


							if( this.s.onRecordStop )
								this.s.onRecordStop();
						}
					} else {

						this.silenceStartTime = Date.now();
					}
				}
			} else {

				this.samples.shift();
				this.samples.push( avg );

				this.tAverage = 0;

				for( var i = 0, len = this.samples.length; i < len; i++ ) {

					this.tAverage += this.samples[ i ];
				}

				this.tAverage /= len;
			}
		} else {

			this.samples.push( avg );
		}
	},

	getData: function() {
		var data = this.mic.getMonoData('left');
		var start = Math.max(0,this.recordingStartIndex-22050);
		var end = data.length-66150;
		return data.subarray(start,end);
	}
};

module.exports = autorecordmic;
