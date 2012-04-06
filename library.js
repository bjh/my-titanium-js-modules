/* 
	NOTE: this code is meant to run under the Appcelerator framework http://www.appcelerator.com/
	
	WHAT: a small module to help with requiring js files within a project. helps with figuring out namespaces. it is probably a bit specialized to the project that it was created from.
	
	TODO: there is also code somewhere for managing load/require more like and object store opposed to just Ti.include'ing the source file, should probably merge that idea in here as well
	
	REQUIRES: underscore.js
*/

exports.Library = (function() {
	// private variables
	var registry = {};

	// private functions
	function to_file_name(namespace) {
		namespace = _(namespace).last();
		return namespace.split(/(?=[A-Z])/).join('_').toLowerCase() + '.js';
	}

	// turns - Thing.Stuff.Whatever into thing/stuff/whatever
	function to_path(namespace) {
		namespace = _(namespace).initial();

		return _(namespace).reduce(function(m, n) {
			return m + '/' + n;
		}, '').toLowerCase();
	}

	function register(component) {
		if (registry[component]) {
			return;
		}

		var ns = component.split('.');
		var file = [to_path(ns), to_file_name(ns)].join('/'); //.replace(/^\/|\/$/g, '');
    
    	Ti.include(file);
		registry[component] = {
			file : file
		};
	}

	// public interface
	return {
		require : function() {
			_(arguments).each(function(component) {
				register(component);
			});
		}
	};
}());
