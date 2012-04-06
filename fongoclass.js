/* 
	NOTE: this code is meant to run under the Appcelerator framework http://www.appcelerator.com/
	
	WHAT: a very basic implementation of Mongo using JavaScript and Sqlite
	allows for tables with dynamic fields be created at you leisure
	it is basically a wrapper around JSON.parse
	
	ANOTHER NOTE: fongo.js came first but it was used as a Singleton, I needed to make Fongo have its own scope/environment every now and then. The two files should probably be married at some point.
	
	REQUIRES: underscore.js, fongo.js, joli.js (for the DB model and the upsert method that is called from the save function which is not included as of yet)
	if you need to the T or pp functions to work you also need to include prettyprint.js
*/
exports.FongoClass = function(data_source) {
	this.current = null;
	this.DATA_SOURCE = data_source || null;
};

var p = exports.FongoClass.prototype;


// var RECORD = DATA_SOURCE.get(data_record.id);
p.datasource = function(data_source){
	this.DATA_SOURCE = data_source;
};

p.active = function(record) {
	// T('Fongo::active');
	if (record) {
		// pp('FongoClass.active setting current to :', record, 'END FongoClass.active');
		this.current = record;
		
		// parse the JSON if it is not done already
		if (_.isString(record.value)) {
			this.current.value = JSON.parse(record.value);
		}
	}
	
	if (!this.current) {
		return Ti.API.error('FongoClass.active() - Null record being requested');
	}
	// pp('FongoClass.active returning', this.current);
	return this.current;
};

p.get = function(id) {
	return this.DATA_SOURCE.get(id);
};

p.field = function(field) {
	// T('Fongo::field', field);
	if (!this.current) {
		Ti.API.error('FongoClass.field() - fongo trying to get value data for a null record');
		return null;
	}
	
	if (_.isDefined(this.current.value)) {
		return this.current.value[field];
	}
	
	Ti.API.warn('FongoClass.field() - this.current.value is null');	
	return null;
};

p.label = function(field, join_with) {
	var value = this.field(field);
	
	if (_.isEmpty(value)) {
		return null;
	}
	
	return [field, value].join(join_with || ': ');
}

// get/set the this.current fongo records value field
p.data = function(incoming) {
	// T('Fongo::data');
	if (!this.current) {
		return Ti.API.error('FongoClass.data() - trying to get/set data for a null record');
	}
	
	if (incoming) {
		// pp('FongoClass.data setting this.current to:', incoming);
		this.current.value = incoming;
	}
	
	// // pp('FongoClass.data returning', this.current.value);
	return this.current.value;
};

p.save = function() {
	T('FongoClass::save');
	if (!this.current) {
		return Ti.API.error('FongoClass.save() - trying to save a null record');
	}
	
	//pp('FongoClass saving:', this.current.key, this.current.value);	
	this.DATA_SOURCE.upsert(this.current.id || null, {
		value:this.current.value,
		key:this.current.key,
		account_id:Application.user.id
	});
};

p.remove = function() {
	// T('Fongo::remove');
	if (!this.current) {
		return Ti.API.error('FongoClass.remove() - trying to remove a null record');
	}
	
	// pp('Fongo removing this.current table:', this.current.key, this.current.value);	
	this.DATA_SOURCE.remove(this.current.id);
};

p.create = function(type) {
	// T('Fongo::create');
	var record = this.DATA_SOURCE.create(type, {});
	this.active(record);
};

p.has_namespace = function(object, selector) {
	// pp('has_namespace', object, selector);
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

p.namespace = function(object, selector, type) {
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

p.hide = function(key, value) {
	var d = this.data();
	// T('Fongo:hide', key, value);
	// create the hidden namespace if it does not exist 
	d.__hidden__ = d.__hidden__ || {};
	return d.__hidden__[key] = value;
};

p.hidden = function(key) {
	var d = this.data();
	
	if (!d || _.isUndefined(d.__hidden__)) {
		return null;
	}
	
	return d.__hidden__[key];
};
