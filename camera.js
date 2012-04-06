/* 
	NOTE: this code is meant to run under the Appcelerator framework http://www.appcelerator.com/
	
	WHAT: A small module wrapping up some of the example camera code which I belive came from the appcelerator forums
	I added in the ability to pass in the cancel/success/error callbacks
	
	REQUIRES: 
*/
exports.pose = function(callback) {
	Titanium.Media.showCamera({
		cancel : function() {
			callback('cancel');
		},
		success : function(event) {
			callback('success', event);
		},
		error : function(error) {
			// create alert
			var a = Titanium.UI.createAlertDialog({title : 'Camera'});

			// set message
			if (error.code == Titanium.Media.NO_CAMERA) {
			 	a.setMessage('Please run this test on device');
			} else {
				a.setMessage('Unexpected Camera error: ' + error.code);
			}

			// show alert
			a.show();
			callback('error', error);
		},
		saveToPhotoGallery : false,
		allowEditing : true,
		mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
	});
};

exports.roll = function(callback) {
	Titanium.Media.openPhotoGallery({
		cancel : function() {
			callback('cancel');
		},
		success : function(event) {
			callback('success', event);
		},
		error : function(error) {
			// create alert
			var a = Titanium.UI.createAlertDialog({title : 'Camera'});

			// set message
			if (error.code == Titanium.Media.NO_CAMERA) {
			 	a.setMessage('Please run this test on device');
			} else {
				a.setMessage('Unexpected Camera error: ' + error.code);
			}

			// show alert
			a.show();
			callback('error', error);
		},
		saveToPhotoGallery : false,
		allowEditing : true,
		mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
	});
};
