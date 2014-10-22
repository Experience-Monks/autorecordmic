<a name="module_autorecordmic"></a>
#autorecordmic
**Members**

* [autorecordmic](#module_autorecordmic)
  * [autorecordmic~isAvailable](#module_autorecordmic..isAvailable)
  * [class: autorecordmic~autorecordmic](#module_autorecordmic..autorecordmic)
    * [new autorecordmic~autorecordmic(settings, callback)](#new_module_autorecordmic..autorecordmic)
    * [autorecordmic.mic](#module_autorecordmic..autorecordmic#mic)
    * [autorecordmic.listen()](#module_autorecordmic..autorecordmic#listen)
    * [autorecordmic.stop()](#module_autorecordmic..autorecordmic#stop)

<a name="module_autorecordmic..isAvailable"></a>
##autorecordmic~isAvailable
autorecordmic.isAvailable will be true when autorecordmic is able to record. In order for 
autorecordmic to be able to record the browser must have AnalyserNode, getUserMedia and AudioContext.

**Scope**: inner member of [autorecordmic](#module_autorecordmic)  
**Type**: `Boolean`  
<a name="module_autorecordmic..autorecordmic"></a>
##class: autorecordmic~autorecordmic
**Members**

* [class: autorecordmic~autorecordmic](#module_autorecordmic..autorecordmic)
  * [new autorecordmic~autorecordmic(settings, callback)](#new_module_autorecordmic..autorecordmic)
  * [autorecordmic.mic](#module_autorecordmic..autorecordmic#mic)
  * [autorecordmic.listen()](#module_autorecordmic..autorecordmic#listen)
  * [autorecordmic.stop()](#module_autorecordmic..autorecordmic#stop)

<a name="new_module_autorecordmic..autorecordmic"></a>
###new autorecordmic~autorecordmic(settings, callback)
autorecordmic will listen to the users surrounding for a certain period
of time and then use the average volume to determine silence.

If the silence is broken then recording will start. Generally this would
be used in situations where someone would like to record speaking in a
relatively quiet environment. Although it may work quite well in moderate
situations.

When you instantiate autorecordmic you can pass the following settings:
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
}

**Params**

- settings `Object` - Settings are described above.  
- callback `function` - This callback will be called when the silence has been sampled
                            and autorecordmic is ready to begin listening  

**Scope**: inner class of [autorecordmic](#module_autorecordmic)  
**Returns**: `autorecordmic` - An instance of autorecordmic  
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

