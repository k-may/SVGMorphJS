/**
 * Created by kev on 16-03-23.
 */
// Include a performance.now polyfill
(function () {

	if ('performance' in window === false) {
		window.performance = {};
	}

	// IE 8
	Date.now = (Date.now || function () {
		return new Date().getTime();
	});

	if ('now' in window.performance === false) {
		var offset = window.performance.timing && window.performance.timing.navigationStart ? window.performance.timing.navigationStart
			: Date.now();

		window.performance.now = function () {
			return Date.now() - offset;
		};
	}

})();

var MORPH = (function () {
	var _morphs = [];
	return {

		add: function (morph) {
			_morphs.push(morph);
		},

		//todo check performance on time
		update: function (time) {

			if (_morphs.length === 0)
				return false;

			var i = 0, numMorphs = _morphs.length;

			time = time !== undefined ? time : window.performance.now();

			while (i < numMorphs) {
				if (_morphs[i].update(time)) {
					i++;
				} else {
					_morphs.splice(i, 1);
					numMorphs--;
				}
			}
			return true;
		},
		draw: function (p) {
			var i = 0, numMorphs = _morphs.length;
			while (i < numMorphs) {
				var morph = _morphs[i++];
				morph.draw(p)
			}
		},
		clear: function () {
			_morphs = [];
		}
	}
})();
