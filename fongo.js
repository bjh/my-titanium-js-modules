/* 
	NOTE: this code is meant to run under the Appcelerator framework http://www.appcelerator.com/
	
	WHAT: a very basic implementation of Mongo using JavaScript and Sqlite
	allows for tables with dynamic fields be created at you leisure
	it is basically a wrapper around JSON.parse
	
	REQUIRES: underscore.js, fongo.js, joli.js (for the DB model and the upsert method that is called from the save function which is not included as of yet)
*/
var current;
var DATA_SOURCE;

exports.datasource = function(data_source){
	DATA_SOURCE = data_source;
};

exports.active = function(record) {
	if (record) {
		current = record;
		
		// parse the JSON if it is not done already
		if (_.isString(record.value)) {
			current.value = JSON.parse(record.value);
		}
	}
	
	if (!current) {
		return Ti.API.error('Fongo.active() - Null record being requested');
	}
	return current;
};

exports.get = function(id) {
	return DATA_SOURCE.get(id);
};

exports.field = function(field) {
	if (!current) {
		Ti.API.error('Fongo.field() - fongo trying to get value data for a null record');
		return null;
	}
	
	if (_.isDefined(current.value)) {
		return current.value[field];
	}
	
	Ti.API.warn('Fongo.field() - current.value is null');	
	return null;
};

exports.label = function(field, join_with) {
	var value = this.field(field);
	
	if (_.isEmpty(value)) {
		return null;
	}
	
	return [field, value].join(join_with || ': ');
}

// get/set the current fongo records value field
exports.data = function(incoming) {
	if (!current) {
		return Ti.API.error('Fongo.data() - trying to get/set data for a null record');
	}
	
	if (incoming) {
		current.value = incoming;
	}
	
	return current.value;
};

exports.save = function() {
	if (!current) {
		return Ti.API.error('Fongo.save() - trying to save a null record');
	}
	
	DATA_SOURCE.upsert(current.id || null, {
		value:current.value,
		key:current.key,
		account_id:Application.user.id
	});
};

exports.remove = function() {
	if (!current) {
		return Ti.API.error('Fongo.remove() - trying to remove a null record');
	}
	
	DATA_SOURCE.remove(current.id);
};

exports.create = function(type) {
	var record = DATA_SOURCE.create(type, {});
	this.active(record);
};

exports.has_namespace = function(object, selector) {
	var keys = selector.split(':');
	var chain = object;
	
	_(keys).each(function(key) {
		if (chain && _.isDefined(chain[key])) {
			chain = chain[key];
		} else {
			chain = null;
		}		
	});
	
	return chain != null;
};

exports.namespace = function(object, selector, type) {
	// dont trample an existing namespace that was created with this function
	if (_.isDefined(object.__ns_store)) {
		var existing = _(object.__ns_store).find(function(item){
			return item == selector;
		});
		
		if (existing) {
			return object;
		} else {
			object.__ns_store.push(selector);
		}
	} else {
		object.__ns_store = [selector];
	}
	
	var keys = selector.split(':');
	
	if (type && _.isArray(type)) {
		if (keys.length == 1) {
			object[keys[0]] = [];
		} else {
			var ns = _(keys).initial().join(':');
			var chain = namespace(object, ns);
			
			_(_(keys).initial()).each(function(key) {
				chain = chain[key];
			});
			
			chain[_(keys).last()] = [];	
		}		
	} else {
		var parent = object;
		var currentPart = '';
	
		_(keys).each(function(part) {
			currentPart = part;
			parent[currentPart] = parent[currentPart] || {};
			parent = parent[currentPart];
		});
	}
	
	return object;
};

exports.hide = function(key, value) {
	var d = this.data();
	// create the hidden namespace if it does not exist 
	d.__hidden__ = d.__hidden__ || {};
	return d.__hidden__[key] = value;
};

exports.hidden = function(key) {
	var d = this.data();
	
	if (!d || _.isUndefined(d.__hidden__)) {
		return null;
	}
	
	return d.__hidden__[key];
};
