/* 
	NOTE: this code is meant to run under the Appcelerator framework http://www.appcelerator.com/
	
	WHAT: a javascript wrapper around https://github.com/bjh/Titanium-Calendar [develop branch] 
	which I tweaked a bit from the original to return actual EKEvent objects and removed some other code I was not using
	
	REQUIRES: underscore.js, fongo.js
*/
var _calendar = require('com.ti.calendar');
var _current = null;

exports.active = function(event) {
	if (event) {
		_current = event;
	}
	
	if (!_current) {
		return Ti.API.error('calendar:active - null calendar event being requested');
	}
	
	return _current;
}

exports.create = function(options) {
	var event = _calendar.createItem({title:"test event"});
	// need to save it so it creates an Id
	event = event.save();
	
	if (options && _.isDefined(options.activate)) {
		return this.active(event);
	}
	
	return event;
};

exports.remove = function(id) {
	if (id) {
		var event = this.find(id);
		
		if (event) {
			var result = event.remove();
		} else {
			Ti.API.error('calendar:remove - trying to remove a non existing event');
		}
	} else {
		if (_current) {
			var result = _current.remove();
			_current = null;
		} else {
			T('I HAVE NO IDEA WHICH CALENDAR ITEM TO REMOVE!');
		}
	}
};

exports.find = function(id, options) {
	if (id) {
		var event = _calendar.findEvent(id);
		
		if (event) {
			if (options && _.isDefined(options.activate)) {
				return this.active(event);
			}			
			return event;
		}
	}
	
	Ti.API.warn('Calendar.find returning null for:', id);
	return null;
};

exports.save = function(options) {
	if (!_current) {
		Ti.API.error('Calendar.save - current event is null');
		return;
	}
	
	if (options && options.fongo) {
		Calendar.set_field('title', Fongo.field('type'));
		Calendar.set_field('notes', Fongo.field('notes').join('\n'));
	}
	
	return (_current = _current.save());
};

exports.set_field = function(field, value) {
	_current['set'+Utility.sentence_case(field)](value);
};

