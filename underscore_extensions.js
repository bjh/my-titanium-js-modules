// add some love to underscore.js

/* 
	NOTE: this code is meant to run under the Appcelerator framework http://www.appcelerator.com/
	
	WHAT: adding methods I keep reusing as underscore mixins
	
	REQUIRES: underscore.js
*/

_.mixin({
	merge: function(self, incoming) {
		return _(self).chain().clone().extend(incoming).value();
	}
});

_.mixin({
	isDefined: function(self, incoming) {
		return !_(self).isUndefined(incoming);
	}
});

_.mixin({
	deepClone: function(obj) {
	  var clone;

	  if (_.isArray(obj)) {
	    clone = _.map(obj, function(elem) {
	      return _.deepClone(elem);
	    });
	  } else if (typeof obj === 'object') {
	    clone = {};
	
	    _.each(obj, function(val, key) {
	      clone[key] = _.deepClone(val);
	    });
	  } else {
	    clone = obj;
	  }
	
	  return clone;
	}
});
