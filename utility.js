// REQUIRES: underscore.js


// return a factory function that creates objects with known fields
exports.builder = function(/* multiple args */) {
	var fields = _(arguments).toArray();
	
	return function(values) {
		if (_.isObject(values)) {
			var data = {};
			
			_(fields).each(function(field){
				data[field] = values[field];
			});
		} else {
			var input = _(arguments).toArray();
			var data = {};
			var n = 0;
			
			_(fields).each(function(field){
				data[field] = input[n++];
			});
		}
		
		return data;
	};
};

// milliseconds to Date String
exports.m_to_s = function(milliseconds) {
	var date = new Date();
	date.setTime(milliseconds);
	return date.toLocaleDateString();
};

// milliseconds to Date 
exports.m_to_d = function(milliseconds) {
	var date = new Date();
	date.setTime(milliseconds);
	return date;
};

// string to Date 
exports.s_to_d = function(value) {
	var ms = Date.parse(value);
	var d = new Date(ms);
	return d; 
};

exports.birthday = function(date) {
	return [
		date.getMonth()+1,
		date.getDate(),		
		date.getFullYear()
	].join('/');
};

exports.d_to_o = function(date) {
	var d = date;
	
	if (_.isString(date)) {
		d = this.s_to_d(d);
	}
	
	return {
		month:d.getMonth()+1,
		day:d.getDate(),		
		year:d.getFullYear()
	};
};

// Date to time as string formatted like: HH:MM AM/PM
exports.d_to_t_s = function(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var post = (hours > 11) ? " PM" : " AM";
	
	minutes = (minutes < 10) ? ("0" + minutes) : minutes;
	
	return (hours + ':' + minutes + post);
};

// used to get the current calender items
exports.today = function() {
	var d = new Date();

	d.setHours(0);
	d.setMinutes(0);
	d.setSeconds(0);
	
	return d.getTime();
};

exports.sentence_case = function(string, all_words) {
	if (all_words) {
		return _(string.split(' ')).map(function(word){
			return [string.charAt(0).toUpperCase(), string.slice(1)].join('');
		});
	}
	
	return [string.charAt(0).toUpperCase(), string.slice(1)].join('');
};

exports.capitalize = function(subject) {
	return this.sentence_case(subject.replace(/([A-Z])/g, " $1"));
};

exports.labelize = function(subject) {
	var label = this.capitalize(subject);
	
	var naughty_list = {
		'Instructions':'Inst.',
		'Frequency':'Freq.',
		'Description':'Desc.',
		'Provider':'Dr.',
		'Emergency':'Contact',
		'Organization':'Org.',
		'Appointment':'Appt.'
	};
	
	return naughty_list[label] || label;
};

exports.safe_name = function(name) {
	return name.split(' ').join('_').toLowerCase();
};

exports.type_to_title = function(type) {
	switch(type) {
		case 'inr': return 'INR';
		case 'heartrate': return 'Heart Rate';
		case 'weight': return 'Weight';
	}
};

exports.months = function(n) {
	return ["January","February","March","April","May","June","July","August","September","October","November","December"][n-1];
};

// exports.days = function(n) {
	// return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][n];
// };

// chain_as_string -> 'table.data[0].rows[0].children'
// table['data'][0]['rows'][0].children
exports.chain_exists = function(scope, chain) {
	var selector = [];
	var rx = /\[(.*?)\]/g;	
	var prepare = function(m) {
		if (m.indexOf("'") >= 0) {
			return m.replace(/^'+|'+$/g, '');
		}
		return parseInt(m);		
	};	
	
	_(chain.split('.')).each(function(part){
		if (part.indexOf('[') >= 0) {
			selector.push(part.split('[')[0]);
			while (match = rx.exec(part)) {
				selector.push(prepare(match[1]));
			}
		} else {
			selector.push(part);
		}
	});
	
	var scope_chain = scope;
	
	_(selector).each(function(key){
		if (scope_chain && scope_chain[key]) {
			scope_chain = scope_chain[key];
		} else {
			scope_chain = null;
		}
	});
	
	return scope_chain != null;	
};