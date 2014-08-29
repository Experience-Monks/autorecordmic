var autorecordmic = require( '../index' );

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

			mic.listen();
		}
	}, function( err ) {

		if( !err ) {

			console.log( 'good to go' );
		} else {

			console.log( 'oopsy error' );
		}
	});
};