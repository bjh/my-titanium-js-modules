/* 
	NOTE: this code is meant to run under the Appcelerator framework http://www.appcelerator.com/
	
	WHAT: A wrapper around the Titanium Contacts.Person object since it gets a bit crazy sometimes
	
	REQUIRES: underscore.js, prettyprint.js
*/

/* 
 * need a global contact manager to ease the pain of all the crazy 
 * reference/variable passing going on with the managing of a tableview 
 * that allows editing a Titanium.Contacts.Person 
 * 
 */
var category = ['address', 'birthday', 'created', 'date', 'department', 'email', 'firstName', 'firstPhonetic', 'fullName', 'image', 'instantMessage', 'jobTitle', 'kind', 'lastName', 'lastPhonetic', 'middleName', 'middlePhonetic', 'modified', 'nickname', 'note', 'organization', 'phone', 'prefix', 'relatedNames', 'suffix', 'url'];
var subcategory = {
	instantMessage: ['aim', 'icq', 'jabber', 'msn', 'yahoo'],
  	address: ['home', 'work', 'other'],
  	email: ['home', 'work', 'other'],
  	date: ['anniversary'],
  	phone: ['home', 'work', 'other', 'mobile', 'pager', 'workFax', 'homeFax', 'main', 'iPhone'],
  	relatedNames: ['mother', 'father', 'parent', 'sister', 'brother', 'child', 'friend', 'spouse', 'partner', 'manager', 'assistant'],
  	url: ['home', 'work', 'other', 'homepage']
};

var current = null;

exports.active = function(contact) {
	if (contact) {
		current = contact;
	}
	
	if (!current) {
		return Ti.API.error('Contact:active - Null contact being requested');
	}
	
	return current;
};

exports.from_id = function(id) {
	this.active(Titanium.Contacts.getPersonByID(id));
	return this.active();
}

exports.refresh = function() {
	if (!current || !current.recordId) {
		return Ti.API.error('Contact module trying to refresh nothing...');
	}
	
	current = Titanium.Contacts.getPersonByID(current.recordId);
};

exports.save = function() {
	Ti.Contacts.save();
};

exports.remove = function() {
	Ti.Contacts.removePerson(current);
	current = null;
	Ti.Contacts.save();
}

exports.display_name = function(contact) {
	if (_.isEmpty(contact['firstName'])  && _.isEmpty(contact['lastName'])) {
		return contact['organization'];
	}
	
	return [
		contact['prefix'], 
		contact['firstName'], 
		contact['lastName']
	].join(' ');
};

exports.is_company = function(contact) {
	return _.isEmpty(contact['firstName'])  && _.isEmpty(contact['lastName']);
};

exports.job_and_org = function(contact) {
	
	if (this.is_company(contact)) {
		return '';
	}
	
	if (_.isEmpty(contact['organization'])) {
		return contact['jobTitle'];
	}
	
	if (_.isEmpty(contact['jobTitle'])) {
		return contact['organization'];
	}
	// the whole enchilada	
	return [contact['jobTitle'], contact['organization']].join(', ');
};

exports.dump = function(contact) {	
	if (!contact) {
		var contact = current;
		
		if (!contact) {
			Ti.API.error('Trying to dump a null contact');
		}
	}
	
	Ti.API.warn('Dumping contact info');
	
	_(category).each(function(key){
		var field = contact[key];

		if (_.isString(field)) {
			T('FIELD', key);
		}
		
		if (field) {
			if (subcategory[key]) {
				_(subcategory[key]).each(function(subkey){
					T('SUBKEY', subkey);
					if (field[subkey]) {
						Ti.API.warn(key + ':' + subkey + ':' + field[subkey]);
					}
				});
			} else {
				Ti.API.warn(key + ':' + field);
			}
		}
	});
	
	Ti.API.warn('FINISHED Dumping contact info');
};
