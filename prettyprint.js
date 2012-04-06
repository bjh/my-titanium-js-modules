
/* 
	NOTE: this code is meant to run under the Appcelerator framework http://www.appcelerator.com/
	
	WHAT: a pretty print function and a more useful trace function
	
	REQUIRES: underscore.js
*/

// pretty print objects
exports.pretty_print = function() {
	_(arguments).each(function(arg){
		Ti.API.info(JSON.stringify(arg));
	});
};

// joins all the arguments into a space separated string - convenient...
exports.trace = function() {
	Ti.API.warn(Array.prototype.slice.call(arguments).join(' '));
};


