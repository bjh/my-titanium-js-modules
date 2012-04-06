/* 
	NOTE: this code is meant to run under the Appcelerator framework http://www.appcelerator.com/
	
	WHAT: the beginnings of a form management library
	
	TODO: add an example
	
	REQUIRES: underscore.js
*/


// add isDefined to underscore
// might seem redundant but I find it reads better, stay positive! 
if (_.isUndefined(_.isDefined)) {
	_.mixin({
		isDefined: function(self, incoming) {
			return !_(self).isUndefined(incoming);
		}
	});	
}

exports.Form = function(container) {
	this.container = container;
	this.focused_field = null;
	this.items = [];
	this.handlers = [];
	this.errors = [];
	this.always_trim = true;
	this.trim = function(input) {
		return input.replace(/^\s+|\s+$/g, '');
	};
};

var p = exports.Form.prototype;

p.set_always_trim = function(state) {
	this.always_trim = state;
};

p.__value__ = function(item) {
	if (_.isDefined(item.value_getter)) {	
		return item.value_getter(item.widget);
	}
	
	if (_.isUndefined(item.widget.value)) {
		var message = _.template("form field: <%= name %> needs a value_getter function...");
		Ti.API.error(message({name:item.name}));
	}
	
	return item.widget.value;
};

// add a control to the form view/container
p.add = function(item) {
	//TODO: this is starting to border on unweildy and ridiculous might need some refactoring love
	this.container.add(item.widget);
	
	// show info button if set
	if (_.isDefined(item.info)) {
		item.widget.rightButton = item.info;
	}
	
	// save the items position in the items array
	item.widget.__index__ = this.items.length;
	
	// to validate or not to validate, that is the question...
	if (_.isDefined(item.validates)) {
		if (item.validates) {
			this.items.push(item);
		} // else it does not get added to the validation list		
	} else {
		this.items.push(item);
	}
	
	// init_value ?
	// TODO: needs a value setter function
	if (_.isDefined(item.init_value)) {
		if (_.isDefined(item.value_setter)) {	
			 item.value_setter(item.widget, item.init_value);
		} else {
			item.widget.value = item.init_value;
		}
	}
	
	// keyboardToolbar?
	if (_.isDefined(item.keyboardToolbar)) {
		item.widget.keyboardToolbar = item.keyboardToolbar; 
	}
	
	var self = this;
	
	// trim on blur and return key?
	if (!(_.isDefined(item.trim) && item.trim == false)) {
		if (this.always_trim) {
			// add trim code to blur and return key pressed events
			var f = function(e){
				e.source.value = self.trim(e.source.value);
			};
			
			item.widget.addEventListener('blur', f);	
			item.widget.addEventListener('return', f);
		}
	}
	
	// // set up FORM wide events
	item.widget.addEventListener('return', function(e){
		self.next();
	});

	item.widget.addEventListener('focus', function(e){
		self.focused_field = e.source;
		
		// WARNING! super cheesy hack to keep the keyboard toolbar showing up
		if (_.isDefined(self.focused_field.keyboardToolbar)) {
			self.focused_field.keyboardToolbar = self.focused_field.keyboardToolbar; 
		}
	});
};

p.next = function() {
	if (!this.focused_field) {
		return;
	}
	var index = this.focused_field.__index__;
	
	if (index <= this.items.length-1) {
		var field = this.items[index+1];
		if (_.isDefined(field.widget.focus)) {
			field.widget.focus();	
		}
		
		if (_.isDefined(field.keyboardToolbar)) {
			field.widget.keyboardToolbar = field.keyboardToolbar; 
		}
	}
};

p.previous = function() {
	if (!this.focused_field) {
		return;
	}
	var index = this.focused_field.__index__;
	
	if (index >= 1) {
		var field = this.items[index-1]; 
		
		if (_.isDefined(field.widget.focus)) {
			field.widget.focus();	
		}
		
		if (_.isDefined(field.keyboardToolbar)) {
			field.widget.keyboardToolbar = field.keyboardToolbar; 
		}	
	}
};

p.hide_keyboard = function() {
	if (this.focused_field) {
		this.focused_field.blur();
	}
};

// add a control to the view that does not need to be validated
p.add_static = function(widget) {
	this.container.add(widget);	
};

p.blur = function() {
	_(this.items).each(function(item) {
		if (_.isDefined(item.widget.blur)) {
			item.widget.blur();
		}
	});
};

p.data = function() {
	var data = {};
	var self = this;
	
	_(this.items).each(function(item) {
		data[item.name] = self.__value__(item);
	});
	
	return data;
};

p.onsubmit = function(f) {
	this.handlers.push(f);
};

p.invalidate = function(field) {
	var control = this.get_field(field);
	
	Ti.API.fireEvent('form:onvalidate', {
		control:control.widget,
		valid:false
	});
};

p.error = function(message) {
	this.errors.push(message);
};

p.get_errors = function() {
	return this.errors.join('\n');
};

p.validate = function() {
	var is_valid = true;
	var self = this;
	self.errors = [];
	
	_(this.items).each(function(item) {	
		if (_.isDefined(item.validate)) {
			var good = item.validate(self.__value__(item));
			
			if (!good) {
				is_valid = false;
				// TODO: if there is no error message passed in create a default error message for the field
				item.error && self.errors.push(item.error);
			}
			
			Ti.API.fireEvent('form:onvalidate', {
				control:item.widget,
				valid:good,
			});
		}
	});
	
	// run the global validation handlers after individual field validators
	_(this.handlers).each(function(onsubmit){
		if (!onsubmit(self)) {
			is_valid = false;
		}
	});
	
	return is_valid;
};

p.get_field = function(name) {
	return _(this.items).find(function(item){
		return item.name == name;
	});
};

p.value_for = function(input_name) {
	var control = _(this.items).find(function(item){
		return item.name == input_name;
	});
	
	if (control) {
		return this.__value__(control);
	}
	
	return null;
};

p.focus = function(name) {
	var field = this.get_field(name);
	
	if (field && _.isDefined(field.widget.focus)) {
		field.widget.focus();
	} else {
		Ti.API.error("form.focus - no focus on field:" + name);
	}
};


// delete p;
