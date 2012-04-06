
/* 
	NOTE: this code is meant to run under the Appcelerator framework http://www.appcelerator.com/
	
	WHAT: small module to create horizontal and vertical lines using TiUiViews
	
	REQUIRES: underscore.js
*/

exports.Line = (function(){
	// TODO: create setter for this
	var _style = {
		thickness:1
	};
	
	var _line = function(x, y, width, height, options) {
		return Ti.UI.createView(_({
			height:height,
			width:width,
			left:x,
			top:y,
			backgroundColor:'#ccc',
			touchEnabled:false
		}).extend(options));
	};
	
	return {
		h:function(x, y, width, options) {
			return _line(x, y, width, _style.thickness, options);
		},
		v:function(x, y, height, options) {
			return _line(x, y, _style.thickness, height, options);
		}
	};
}());
