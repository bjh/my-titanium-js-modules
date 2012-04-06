/* 
	NOTE: this code is meant to run under the Appcelerator framework http://www.appcelerator.com/
	
	WHAT: manages validation functions that can be chained together, also supports passing arguments 
	
	TODO: example code, show arguments
	
	REQUIRES: underscore.js, usually paired with form.js
*/

// using module pattern since this should be treated as a Singleton which manages every validator
exports.Validation = (function(){
	var validators = {};
	
	return {
		register:function(name, validator) {
			// TODO: make sure there is not a name collision (hasOwnProperty ?)
			validators[name] = validator;
		},
		chain:function() {
			var chained_validators = [];
			
			// set up the validation chain
			_(arguments).each(function(validator){
				if (_.isFunction(validator)) {
					chained_validators.push(validator);
				} else if (_.isString(validator)) {
					// does the validator have parameters?
					if (validator.indexOf(':') > 1) {
						var chunks = validator.split(':');
						// TODO: make sure validator exists...
						chained_validators.push(validators[chunks[0]](chunks[1]));
					} else if (validators[validator]) {
						chained_validators.push(validators[validator]);
					} else {
						Ti.API.error('Validation module - Cannot find validator named: ' + validator);
					}
				}
			});
			
			// create and return the function that will run all the validations
			return function(input) {
				return _(chained_validators).all(function(validator){
					return validator(input);
				}); 
			};
		}
	};
}());

exports.Validation.register('required', function(input){
	// Ti.API.info('required input: ' + (typeof input));
	if (_.isNumber(input)) {
		return true;
	}
	
	// NOTE: assuming input is a String at this point
	return input.length > 0;
});

exports.Validation.register('numeric', function(input){
	// Ti.API.info('numeric input: ' + input);	
	return !isNaN(parseFloat(input)) && isFinite(input);
});

exports.Validation.register('min', function(size){
	return function(input) {
		return input.length >= size;
	};
});

exports.Validation.register('max', function(size){
	return function(input) {
		return input.length <= size;
	};
});

exports.Validation.register('email', function(input){
	// some hideous regex from the internets [moar long pleeze!]
	var re = /[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+(?:\.[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?/;
	return re.test(input);	
});


