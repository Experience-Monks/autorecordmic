var autorecordmic = require( '../index' ),
	wavencoder = require( 'wavencoder' ),
	browsersavefile = require( 'browsersavefile' );

wavencoder = wavencoder( {

	noWorker: true
});

wavencoder.init();


window.onload = function() {

	var mic = autorecordmic( {

		onSampleFinished: function() {

			console.log( 'sampling finished' );

			mic.listen();
		},
		onRecordStart: function() {

			console.log( 'started recording' );
		},
		onRecordStop: function() {

			console.log( 'stopped recording' );

			wavencoder.setInterleaved( mic.getStereoData() );

			wavencoder.exportWAV( function( data ) {

				console.log( data );

				browsersavefile( 'output.wav', data );
			});

			// mic.listen();
		}
	}, function( err ) {

		if( !err ) {

			console.log( 'good to go' );
		} else {

			console.log( 'oopsy error' );
		}
	});
};