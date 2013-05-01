var MORPH = (function() {
	var _morphs = [];
	return {

		add : function(morph) {
			_morphs.push(morph);
			trace("============================================>>aDD MORPH " + _morphs.length);
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
		}
	}

})();

MORPH.Morph = function(shapes, obj) {
	var _shapes = shapes;
	var _currentIndex = 1, _count = 0;
	var _numShapes = _shapes.length;
	var _current;
	var _shape = [];
	var _morphSegmentGroups = [];
	var _ratio;
	var _startTime;
	var _duration = obj["duration"] || 1000;
	var _delayTime = 0;
	var _looping = obj["looping"] || false;
	var _completeCallback;
	
	function init() {
		var i = 0;
		while (_morphSegmentGroups.length < _shapes.length) {
			var morphSegmentGroup = MORPH.createMorphSegmentGroup(_shapes[i], _shapes[(i + 1) % _shapes.length]);
			_morphSegmentGroups.push(morphSegmentGroup);
			i++;
		}
	}


	this.start = function(time) {
		_startTime = time !== undefined ? time : Date.now();
		_startTime += _delayTime;
		MORPH.add(this);
	}

	this.update = function(time) {
		_ratio = (time - _startTime) / _duration;

		var index = Math.floor(_ratio * _numShapes);
		//trace(index + " : " + (_ratio * _numShapes));
		if (index + 1 > _numShapes) {

			if (_completeCallback != null)
				_completeCallback();

			if (_looping) {
				_startTime = Date.now();
				_current = 0;
				return true;
			} else
				return false;
		}
		_current = index;
		return true;
	}

	this.getCurrentRatio = function() {
		return (_ratio * _numShapes) - _current;
	}
	this.getMorphSegmentGroup = function() {
		return _morphSegmentGroups[_current];
	}

	this.getShape = function() {
		var shape = [];
		//try {
		var currentMSG = this.getMorphSegmentGroup();
		var r = this.getCurrentRatio();
		//trace("-->" + r + " : " + _current);
		for (var i = 0; i < currentMSG.length; i++) {

			var morphSegmentGroup = currentMSG[i];

			var segs = morphSegmentGroup.interpolate(r);
			shape.push(segs);

		}
		// } catch(e) {
		// trace(e);
		// }
		return shape;
	}

	this.draw = function(p) {
		var shape = this.getShape();
		for (var s = 0; s < shape.length; s++) {
			var segs = shape[s];
			for (var i = 0; i < segs.length; i++) {
				segs[i].draw(p);
			}
		}
	}

	this.onComplete = function(callback) {

		_onCompleteCallback = callback;
		return this;

	};

	init();
	
	return this;
}

MORPH.createMorphSegmentGroup = function(seg1, seg2) {
	var morphSegmentGroup = new Array();
	var async = seg1.length != seg2.length;
	var s1 = seg1.length;
	var s2 = seg2.length;
	var async = s1 != s2;
	var minCount = Math.min(s1, s2);
	/*var maxArr = seg1.length >= seg2.length ? seg1.concat() : seg2.concat();
	 var minArr = seg1.length >= seg2.length ? seg2.concat() : seg1.concat();

	 var m1 = minArr.length;
	 var m2 = maxArr.length;
	 var diff = m1 / m2;
	 */

	var k1 = 0, k2 = 0;
	for (var k = 0; k < minCount; k++) {
		//var count = k2 * (minArr.length/maxArr.length);
		var arr1 = [], arr2 = [];
		if (s2 > s1) {
			k1 = k;
			arr1.push(seg1[k1]);

			while (k2 * (s1 / s2) < (k + 1) && k2 < s2) {
				arr2.push(seg2[k2])
				k2++;
			}
		} else {
			k2 = k;
			arr2.push(seg2[k2]);
			while (k1 * (s2 / s1) < (k + 1) && k1 < s1) {
				arr1.push(seg1[k1]);
				k1++
			}

		}
		morphSegmentGroup.push(new MORPH.MorphSegmentGroup(arr1, arr2));
	}
	return morphSegmentGroup;
}

MORPH.MorphSegmentGroup = function(origSegs, destSegs) {
	var _origSegs = origSegs || [];
	var _destSegs = destSegs || [];
	this.heteromorphic = origSegs.length != destSegs.length;
	var _maxLength = Math.max(_origSegs.length, _destSegs.length);
	var _segs, _startSegs, _endSegs;
	var _interSeg;

	if (!this.heteromorphic) {
		_segs = new Array();
		for (var i = 0; i < _maxLength; i++) {
			_segs.push(new svgMorph.MorphSegment(_origSegs[i], _destSegs[i]));
		}
	} else {
		_interSeg = new svgMorph.Segment(_origSegs[0].pt1.Interpolate(_destSegs[0].pt1, 0.5), null, _origSegs[_origSegs.length - 1].pt2.Interpolate(_destSegs[_destSegs.length - 1].pt2, 0.5), null);
		_segs = _startSegs = defineStartInterSegs();
	};

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
		///console.dir(interSegs);
		return interSegs
	}


	this.interpolate = function(percentage) {
		var segs = [];

		if (this.heteromorphic)
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

}

