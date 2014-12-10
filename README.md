<a name="module_autorecordmic"></a>
#autorecordmic

##Example:

How you work with `autorecordmic` is that you first instantiate it. It begins to listen to the
the ambient sounds in the room and it determines an average volume or activity level for the
space. Once that sampling is finished a function will be called where you should then call `listen`.

If the activity level goes above the average then recording is started and once it goes below recording
is stopped.

```javascript
var autorecordmic = require( 'autorecordmic' );

// check if this browser can support recording from the mic
if( autorecordmic.isAvailable ) {

	var mic = autorecordmic( {

		// onSampleFinished will be called once an average volume
		// for the room has been determined
		onSampleFinished: function() {

			console.log( 'sampling finished' );

			// telling the mic to listen will start checking
			// if the volume level goes above a certain level
			// if so recording will start and the onRecordStart
			// will be called
			mic.listen();
		},

		// onRecordStart will be called once audio date is being recorded
		// this happens when the volume of the mic is above the average 
		// volume level
		onRecordStart: function() {

			console.log( 'started recording' );
		},

		// onRecordStop will be called when recording has stopped due
		// to the rooms volume getting below the average volume
		onRecordStop: function() {

			console.log( 'stopped recording' );

			// get the recorded data
			var data = mic.getStereoData()

			// do something with the recorded data

			// tell the mic to listen again
			mic.listen();
		}
	}, function( err ) {

		if( !err ) {

			console.log( 'good to go' );
		} else {

			console.log( 'oopsy error' );
		}
	});
}
```
<a name="module_autorecordmic..isAvailable"></a>
##autorecordmic.isAvailable
autorecordmic.isAvailable will be true when autorecordmic is able to record. In order for 
autorecordmic to be able to record the browser must have AnalyserNode, getUserMedia and AudioContext.

**Scope**: inner member of [autorecordmic](#module_autorecordmic)  
**Type**: `Boolean`  
<a name="module_autorecordmic..autorecordmic"></a>
##class: autorecordmic
**Members**

* [class: autorecordmic~autorecordmic](#module_autorecordmic..autorecordmic)
  * [new autorecordmic~autorecordmic(settings, callback)](#new_module_autorecordmic..autorecordmic)
  * [autorecordmic.mic](#module_autorecordmic..autorecordmic#mic)
  * [autorecordmic.listen()](#module_autorecordmic..autorecordmic#listen)
  * [autorecordmic.stop()](#module_autorecordmic..autorecordmic#stop)
  * [autorecordmic.getChannelData()](#module_autorecordmic..autorecordmic#getChannelData)
  * [autorecordmic.getMonoData([mono])](#module_autorecordmic..autorecordmic#getMonoData)
  * [autorecordmic.getStereoData([mono])](#module_autorecordmic..autorecordmic#getStereoData)

<a name="new_module_autorecordmic..autorecordmic"></a>
###new autorecordmic(settings, callback)
autorecordmic will listen to the users surrounding for a certain period
of time and then use the average volume to determine silence.

If the silence is broken then recording will start. Generally this would
be used in situations where someone would like to record speaking in a
relatively quiet environment. Although it may work quite well in moderate
situations.

When you instantiate autorecordmic you can pass the following settings:
```javascript
{
	averageDuration: 3000, // how many milliseconds should we listen to silence 
						   // for default is 3000 milliseconds
	recordStartLevel: 10, // this is the intensity at which to begin recording. 
						  // The smaller the value the easier silence is broken
	quietDuration: 1000, // this duration is used to determine when to stop the
						 // recording. So if it's quiet for 1000 milliseconds
						 // we will stop recording.
	maxDuration: 6000, // This is the maximum duration for our recording in
					   // milliseconds. Put a very large number to infinitely record
	onSampleFinished: null, // This is a callback which will be called once the average
							// silence is figured out. You can call recordmic.listen 
							// after this
	onRecordStart: null, // This callback will be called once silence is broken and
						 // autorecordmic begins recording data
	onRecordStop: null // This callback will be called once recording has stopped
 				   // due to silence


	/////////////// THE FOLLOWING ARE SETTINGS FOR recordmic ///////////////
	volume: 1, // this is the volume at which the mic will record by default 
			   // this value is 1
	bufferSize: 2048, // this is the size of the buffer as its recording. 
					  // Default is 2048
	mono: false // whether the mic will record in mono by default this value 
				// is false (it will record in stereo) mono can also be 'left' 
				// or 'right' to define which channel is being used.
	onSampleData: null // this is a callback if you want to access sampledata 
					   // as it's being recorded. You can for instance modify 
					   // data as it's being recorded.
}
```

**Params**

- settings `Object` - Settings are described above.  
- callback `function` - This callback will be called when the silence has been sampled
						and autorecordmic is ready to begin listening  

<a name="module_autorecordmic..autorecordmic#mic"></a>
###autorecordmic.mic
mic is the recordmic which will be used to record audio. Use this also to grab the recorded
data.

For more info on record mic go here:
https://www.npmjs.org/package/recordmic

**Type**: `recordmic`  
<a name="module_autorecordmic..autorecordmic#listen"></a>
###autorecordmic.listen()
Calling this function will cause autorecordmic to begin listening. While it's listening
if the sound intensity goes above recordStartLevel autorecordmic will begin recording audio.

<a name="module_autorecordmic..autorecordmic#stop"></a>
###autorecordmic.stop()
Calling this function will stop recording and stop listening.

<a name="module_autorecordmic..autorecordmic#getChannelData"></a>
###autorecordmic.getChannelData()
getChannelData will return return both left and right channel data from our recording.
If we're recording in mono one of the channels will be null.

The data returned for each channel are Float32Array arrays.

**Returns**: `Object` - This object will have two variables 'left' and 'right' which 
                 contain the data for each channel.  
<a name="module_autorecordmic..autorecordmic#getMonoData"></a>
###autorecordmic.getMonoData([mono])
This will return mono data for our recording. What is returned is a Float32Array.
The mono setting will determine which array will be returned. If mono is set to true
then the left channel will be returned over the right.

**Params**

- \[mono\] `String` - This is optional. either 'left' or 'right' to determine which channel will be returned.  

**Returns**: `Float32Array` - The sound data for our recording as mono  
<a name="module_autorecordmic..autorecordmic#getStereoData"></a>
###autorecordmic.getStereoData([mono])
getStereoData will return both the left and right channel interleaved as a Float32Array.

You can also pass in a value for mono. If you do then one of the channells will be interleaved as
stereo data.

So for instance in stereo:
```[ left_data1, right_data1, left_data2, right_data2, left_data3, right_data3 ]```

And if mono is set to 'left':
```[ left_data1, left_data1, left_data2, left_data2, left_data3, left_data3 ]```

**Params**

- \[mono\] `String` - If you'd like to get mono data interleaved as stereo data either pass 'left' or 'right'  

**Returns**: `Float32Array` - Sound data interleaved as a Float32Array.  
