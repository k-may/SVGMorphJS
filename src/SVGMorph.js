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

MORPH.MorphablePath = function (morphableGroups) {
	return {
		morphableGroups: morphableGroups
	};
};
MORPH.createMorphablePath = function (segGroup1, segGroup2) {
	var morphableGroups = [];
	var s1 = segGroup1.length;
	var s2 = segGroup2.length;
	var minCount = Math.min(s1, s2);

	var k1 = 0, k2 = 0;
	for (var k = 0; k < minCount; k++) {
		var arr1 = [], arr2 = [];
		if (s2 > s1) {
			k1 = k;
			arr1.push(segGroup1[k1]);

			while (k2 * (s1 / s2) < (k + 1) && k2 < s2) {
				arr2.push(segGroup2[k2]);
				k2++;
			}
		} else {
			k2 = k;
			arr2.push(segGroup2[k2]);
			while (k1 * (s2 / s1) < (k + 1) && k1 < s1) {
				arr1.push(segGroup1[k1]);
				k1++
			}

		}
		if (arr1.length !== arr2.length) {
			morphableGroups.push(new MORPH.MorphableGroup(arr1, arr2));
		} else {
			morphableGroups.push(new MORPH.MorphableGroupParallel(arr1, arr2));
		}
	}
	return new MORPH.MorphablePath(morphableGroups);
};

