var MORPH = (function() {
	var _morphs = [];
	return {

		add : function(morph) {
			_morphs.push(morph);
		},

		update : function(time) {

			if (_morphs.length === 0)
				return false;

			var i = 0, numMorphs = _morphs.length;

			time = time !== undefined ? time : Date.now();

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
		draw : function(p) {
			var i = 0, numMorphs = _morphs.length;
			while (i < numMorphs) {
				var morph = _morphs[i++];
				morph.draw(p)
			}
		},
		clear : function(){
			_morphs = [];
		}
	}
})();

MORPH.Morph = function(paths, obj) {
	var _paths = paths;
	var _currentIndex = 1, _count = 0;

	var _current = 0;
	var _shape = [];
	var _morphablePathCollection = [];
	var _ratio = 0;
	var _startTime;
	var _duration = obj["duration"] || 1000;
	var _delayTime = 0;
	var _looping = obj["looping"] || false;
	var _numPaths = _looping ? _paths.length + 1 : _paths.length;
	//var _numGroups = _numPaths - 1;
	var _completeCallback = obj["onComplete"];
	var _x = 0, _y = 0;

	function init() {
		reset();
	}

	function reset() {
		var i = 0;
		if (_numPaths > 1) {
			_morphablePathCollection = [];
			while (_morphablePathCollection.length < _numPaths - 1) {
				var Morphables = MORPH.createMorphablePath(_paths[i].getSegments(), _paths[(i + 1) % _paths.length].getSegments());
				_morphablePathCollection.push(Morphables);
				i++;
			}
		} else
			_morphablePathCollection.push(_paths[0]);
	}


	this.start = function(time) {
		_startTime = time !== undefined ? time : Date.now();
		_startTime += _delayTime;
		MORPH.add(this);
	}

	this.update = function(time) {
		var isComplete, index = 0;

		_ratio = Math.max(0, Math.min(1, (time - _startTime) / _duration));

		if (_numPaths > 1) {
			var index = Math.floor(_ratio * (_numPaths - 1));
			isComplete = index >= _numPaths - 1;
		} else {
			isComplete = _ratio >= 1;
		}

		if (isComplete) {

			if (_completeCallback != null)
				_completeCallback();

			if (_looping) {
				_startTime = Date.now();
				_current = 0;
				_ratio = 0;
				return true;
			}
			return false;
		} else
			_current = index;
		return true;
	}

	this.getCurrentPath = function() {
		return _paths[_paths.length - 1];
	}
	
	this.getCurrentRatio = function() {
		var cR = (_ratio * (_numPaths - 1)) - _current;
		return cR;
	}
	this.getCurrentMorphablePath = function() {
		if (_current < _morphablePathCollection.length)
			return _morphablePathCollection[_current];
		else {
			console.log("Error : something wrong here!");
		}
	}

	this.getShape = function() {
		if (_numPaths > 1)
			return this.currentShape();
		else {
			var path = _paths[0];
			return new MORPH.shape(path.getSegments());
		}
	}

	this.currentShape = function() {
		var currentMorphablePathGroups = this.getCurrentMorphablePath().morphableGroups;

		var ratio = this.getCurrentRatio();
		var numGroups = currentMorphablePathGroups.length;
		var numSegs = currentMorphablePathGroups.length;
		var segs = [];

		for (var i = 0; i < numSegs; i++) {
			var morphableSegmentGroup = currentMorphablePathGroups[i];
			var morphedSegs = morphableSegmentGroup.interpolate(ratio);
			segs = segs.concat(morphedSegs);
		}

		return new MORPH.shape(segs);
	}

	this.onComplete = function(callback) {
		_onCompleteCallback = callback;
		return this;
	};

	this.setScale = function(scale) {
		for (var i = 0; i < _paths.length; i++) {
			_paths[i].setScale(scale);
		}
		reset();
	}

	this.getWidth = function() {
		var w = 0;
		for (var i = 0; i < _paths.length; i++) {
			if (_paths[i].width() > w)
				w = _paths[i].width();
		}
		return w;
	}

	this.getHeight = function() {
		var h = 0;
		for (var i = 0; i < _paths.length; i++) {
			if (_paths[i].height() > h)
				h = _paths[i].height();
		}
		return h;
	}

	this.setPos = function(x, y) {
		var diffX = x - _x;
		var diffY = y - _y;
		_x = x;
		_y = y;
		var i = 0;
		while (i < _paths.length) {
			var path = _paths[i];
			path.translate(x, y);
			i++;
		}
	}
	init();
	return this;
}

MORPH.createMorphablePath = function(segGroup1, segGroup2) {
	var morphableGroups = new Array();
	var async = segGroup1.length != segGroup2.length;
	var s1 = segGroup1.length;
	var s2 = segGroup2.length;
	var async = s1 != s2;
	var minCount = Math.min(s1, s2);

	var k1 = 0, k2 = 0;
	for (var k = 0; k < minCount; k++) {
		var arr1 = [], arr2 = [];
		if (s2 > s1) {
			k1 = k;
			arr1.push(segGroup1[k1]);

			while (k2 * (s1 / s2) < (k + 1) && k2 < s2) {
				arr2.push(segGroup2[k2])
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
		morphableGroups.push(new MORPH.MorphableGroup(arr1, arr2));
	}
	return new MORPH.MorphablePath(morphableGroups);
}

MORPH.MorphableGroup = function(origSegs, destSegs) {
	var _origSegs = origSegs || [];
	var _destSegs = destSegs || [];
	var _heteromorphic = origSegs.length != destSegs.length;
	var _maxLength = Math.max(_origSegs.length, _destSegs.length);
	var _segs, _startSegs, _endSegs;
	var _interSeg;

	function init() {
		if (!_heteromorphic) {
			_segs = new Array();
			if (_destSegs) {
				for (var i = 0; i < _maxLength; i++) {
					_segs.push(new svgMorph.MorphSegment(_origSegs[i], _destSegs[i]));
				}
			} else
				_segs = _origSegs;

		} else {
			_interSeg = new svgMorph.Segment(_origSegs[0].pt1.Interpolate(_destSegs[0].pt1, 0.5), null, _origSegs[_origSegs.length - 1].pt2.Interpolate(_destSegs[_destSegs.length - 1].pt2, 0.5), null);
			_segs = _startSegs = defineStartInterSegs();
		};
	}


	this.translate = function(x, y) {

		setSegmentPos(_origSegs, x, y);

		if (destSegs)
			setSegmentPos(_destSegs, x, y);

		function setSegmentPos(segArray, x, y) {
			var i = 0;
			for (var i = 0; i < segArray.length; i++) {
				segArray[i].translate(x, y);
			}
		}

		init();
	}
	function defineStartInterSegs() {
		var interSegs = new Array();
		var percentage, pt1, pt2;
		pt2 = _interSeg.pt1;
		//create array of morph points
		var i = 0;
		while (i < _origSegs.length) {
			percentage = (i + 1) / _origSegs.length;
			pt1 = pt2.clone();
			pt2 = _interSeg.pt1.Interpolate(_interSeg.pt2, percentage);
			var seg = new svgMorph.Segment(pt1, null, pt2, null);
			interSegs.push(new svgMorph.MorphSegment(_origSegs[i], seg));
			i++;
		}
		return interSegs
	}

	function defineEndInterSegs() {
		var interSegs = new Array();
		var percentage, pt1, pt2;
		pt2 = _interSeg.pt1;
		//create array of svgMorph points
		var i = 0;
		while (i < _destSegs.length) {
			percentage = (i + 1) / _destSegs.length;
			pt1 = pt2.clone();
			pt2 = _interSeg.pt1.Interpolate(_interSeg.pt2, percentage);
			var seg = new svgMorph.Segment(pt1, null, pt2, null);
			interSegs.push(new svgMorph.MorphSegment(seg, _destSegs[i]));
			i++;
		}
		return interSegs
	}


	this.interpolate = function(percentage) {
		var segs = [];

		if (_heteromorphic)
			percentage = interpolateHetero(percentage);

		for (var i = 0; i < _segs.length; i++) {
			segs.push(_segs[i].interpolate(percentage));
		}
		return segs;
	}
	function interpolateHetero(percentage) {
		if (percentage >= 0.5) {
			if (!_endSegs)
				_endSegs = defineEndInterSegs(_interSeg.pt1, _destSegs);

			_segs = _endSegs;
		} else
			_segs = _startSegs;

		return percentage < 0.5 ? percentage / 0.5 : (percentage - 0.5) / 0.5;
	}

	init();
}

MORPH.MorphablePath = function(morphableGroups) {
	return {
		morphableGroups : morphableGroups
	};
}

MORPH.shape = function(segmentCollection) {
	var _segmentCollection = segmentCollection || [];
	return {
		segmentCollection : _segmentCollection,
		length : segmentCollection.length
	};
}
