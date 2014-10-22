/** @module autorecordmic */
var recordmic = require( 'recordmic' );

/**
 * autorecordmic will listen to the users surrounding for a certain period
 * of time and then use the average volume to determine silence.
 *
 * If the silence is broken then recording will start. Generally this would
 * be used in situations where someone would like to record speaking in a
 * relatively quiet environment. Although it may work quite well in moderate
 * situations.
 *
 * When you instantiate autorecordmic you can pass the following settings:
 * ```javascript
 * {
 * 	averageDuration: 3000, // how many milliseconds should we listen to silence 
 * 						   // for default is 3000 milliseconds
 * 	recordStartLevel: 10, // this is the intensity at which to begin recording. 
 * 						  // The smaller the value the easier silence is broken
 * 	quietDuration: 1000, // this duration is used to determine when to stop the
 * 						 // recording. So if it's quiet for 1000 milliseconds
 * 						 // we will stop recording.
 * 	maxDuration: 6000, // This is the maximum duration for our recording in
 * 					   // milliseconds. Put a very large number to infinitely record
 * 	onSampleFinished: null, // This is a callback which will be called once the average
 * 							// silence is figured out. You can call recordmic.listen 
 * 							// after this
 * 	onRecordStart: null, // This callback will be called once silence is broken and
 * 						 // autorecordmic begins recording data
 *  onRecordStop: null // This callback will be called once recording has stopped
 *  				   // due to silence
 *
 *
 *  /////////////// THE FOLLOWING ARE SETTINGS FOR recordmic ///////////////
 * 	volume: 1, // this is the volume at which the mic will record by default 
 * 			   // this value is 1
 * 	bufferSize: 2048, // this is the size of the buffer as its recording. 
 * 					  // Default is 2048
 * 	mono: false // whether the mic will record in mono by default this value 
 * 				// is false (it will record in stereo) mono can also be 'left' 
 * 				// or 'right' to define which channel is being used.
 * 	onSampleData: null // this is a callback if you want to access sampledata 
 * 					   // as it's being recorded. You can for instance modify 
 * 					   // data as it's being recorded.
 * }
 * ```
 * 
 * @class
 * @param  {Object}   settings Settings are described above.
 * @param  {Function} callback This callback will be called when the silence has been sampled
 *                             and autorecordmic is ready to begin listening
 * @return {autorecordmic} An instance of autorecordmic
 */
var autorecordmic = function( settings, callback ) {

	if( !( this instanceof autorecordmic ) )
		return new autorecordmic( settings, callback );

	if( autorecordmic.isAvailable ) {

		var s = this.s = settings || {};
		s.averageDuration = s.averageDuration || 3000;
		s.recordStartLevel = s.recordStartLevel || 10;
		s.quietDuration = s.quietDuration || 1000;
		s.maxDuration = s.maxDuration || 6000;

		/**
		 * mic is the recordmic which will be used to record audio. Use this also to grab the recorded
		 * data.
		 *
		 * For more info on record mic go here:
		 * https://www.npmjs.org/package/recordmic
		 * 
		 * @type {recordmic}
		 */
		this.mic = recordmic( this.s, this.onMicInit.bind( this, callback ) );
	} else {

		callback( new Error( 'this browser is not supported' ) );
	}
};

/**
 * autorecordmic.isAvailable will be true when autorecordmic is able to record. In order for 
 * autorecordmic to be able to record the browser must have AnalyserNode, getUserMedia and AudioContext.
 *
 * @var {Boolean} isAvailable
 */
autorecordmic.isAvailable = typeof AnalyserNode !== 'undefined' && recordmic.isAvailable;

autorecordmic.prototype = {

	/**
	 * Calling this function will cause autorecordmic to begin listening. While it's listening
	 * if the sound intensity goes above recordStartLevel autorecordmic will begin recording audio.
	 */
	listen: function() {
		this.isListening = true;

		this.mic.clear(); // clear out any data which may have been recorded
		this.mic.start();
	},

	/**
	 * Calling this function will stop recording and stop listening.
	 */
	stop: function() {
		this.reachedMaxSamples = true;
		this.isListening = false;
		this.isRecording = false;
		this.mic.stop();
	},

	/**
	 * getChannelData will return return both left and right channel data from our recording.
	 * If we're recording in mono one of the channels will be null.
	 *
	 * The data returned for each channel are Float32Array arrays.
	 * 
	 * @return {Object} This object will have two variables 'left' and 'right' which 
	 *                  contain the data for each channel.
	 */
	getChannelData: function() {

		var rVal = this.mic.getChannelData();

		// trim out silence
		rVal.left = rVal.left.subarray( 0, this.silenceStartLength );
		rVal.right = rVal.right.subarray( 0, this.silenceStartLength );

		return rVal;
	},

	/**
	 * This will return mono data for our recording. What is returned is a Float32Array.
	 * The mono setting will determine which array will be returned. If mono is set to true
	 * then the left channel will be returned over the right.
	 * 
	 * @param  {String} [mono] This is optional. either 'left' or 'right' to determine which channel will be returned.
	 * @return {Float32Array} The sound data for our recording as mono
	 */
	getMonoData: function( mono ) {

		return this.mic.getMonoData( mono ).subarray( 0, this.silenceStartLength );
	},

	/**
	 * getStereoData will return both the left and right channel interleaved as a Float32Array.
	 *
	 * You can also pass in a value for mono. If you do then one of the channells will be interleaved as
	 * stereo data.
	 *
	 * So for instance in stereo:
	 * ```[ left_data1, right_data1, left_data2, right_data2, left_data3, right_data3 ]```
	 *
	 * And if mono is set to 'left':
	 * ```[ left_data1, left_data1, left_data2, left_data2, left_data3, left_data3 ]```
	 * 
	 * @param  {String} [mono] If you'd like to get mono data interleaved as stereo data either pass 'left' or 'right'
	 * @return {Float32Array} Sound data interleaved as a Float32Array.
	 */
	getStereoData: function( mono ) {

		return this.mic.getStereoData( mono ).subarray( 0, this.silenceStartLength * 2 );
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

						this.isRecording = true;
						this.mic.start();

						if( this.s.onRecordStart )
							this.s.onRecordStart();
					}

					this.silenceStartLength = 0;
					this.silenceStartTime = undefined;
				//if we're recording then we should check for silence
				} else if( this.isRecording ) {

					if( this.silenceStartTime ) {
						var time = Date.now() - this.silenceStartTime;
						if( time > this.s.quietDuration || time > this.s.maxDuration ) {

							this.isListening = false;
							this.isRecording = false;
							this.mic.stop();


							if( this.s.onRecordStop )
								this.s.onRecordStop();
						}
					} else {

						this.silenceStartLength = this.mic.getMonoData().length;
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
	}
};

module.exports = autorecordmic;
