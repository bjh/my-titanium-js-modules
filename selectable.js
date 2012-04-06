/* 
	NOTE: this code is meant to run under the Appcelerator framework http://www.appcelerator.com/
	
	WHAT: create namespaces in/on objects, mostly used by fongo.js at this point to create nested fields if they do not exist yet
	
	e.g. 
	var thing = {};
	Selectable(thing, 'first:second:third:fourth');
	
	REQUIRES: underscore.js, fongo.js, joli.js (for the DB model and the upsert method that is called from the save function which is not included as of yet)
*/

// NOTE: the colon is used as the namespace separator right now, it should be able to be set/changed by the user
exports.Selectable = function(object) {
    if (_.isUndefined(object.$)) {
	    _(object).extend({
	        $: function(selector, value) {
	            var keys = selector.split(':');
	
	            // just a get/set operation when the selector is a single key
	            if (keys.length == 1) {
	                if (value) {
	                    return this[selector] = value;
	                } else {
	                    return this[selector];
	                }
	            }
	
	            // drill down to the end of the chain
	            var ns = _(keys).initial().join(':');
	            
	            if (value) {
	            	// set the value at the end of the cahin
	                var chain = this;
	
	                _(_(keys).initial()).each(function(key) {
	                    chain = chain[key];
	                });
	                
	                chain[_(keys).last()] = value;
	            } else {
	                return _(keys).reduce(function(chain, key) {
	                    return chain[key];
	                }, this);
	            }
	        }
	    });
	}
};
