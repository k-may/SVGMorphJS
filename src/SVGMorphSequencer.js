/**
 * Morphable object
 *
 * @param paths
 * @param obj
 * @returns {MORPH.Morph}
 * @constructor
 */
MORPH.Morph = function (paths, obj) {
	obj = obj || {};

	//todo protect this variables!
	var _paths = paths;
	var _current = 0;
	var _morphablePathCollection = [];
	var _ratio = 0;
	var _startTime;
	var _duration = obj["duration"] || 1000;
	var _delayTime = 0;
	var _looping = obj["looping"] || false;
	var _numPaths = _looping ? _paths.length + 1 : _paths.length;
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

	this.start = function (time) {
		_startTime = time !== undefined ? time : window.performance.now();
		_startTime += _delayTime;
		MORPH.add(this);

		return this;
	};
	this.update = function (time) {
		var isComplete, index = 0;

		//todo test this!
		/*_ratio = Math.max(0, Math.min(1, (time - _startTime) / _duration));

		if (_numPaths > 1) {
			index = Math.floor(_ratio * (_numPaths - 1));
			isComplete = index >= _numPaths - 1;
		} else {
			isComplete = _ratio >= 1;
		}*/

		var r = Math.max(0, Math.min(1, (time - _startTime) / _duration));
		isComplete = this.setRatio(r);

		if (isComplete) {

			if (_completeCallback != null)
				_completeCallback();

			if (_looping) {
				_startTime = time !== undefined ? time : window.performance.now();
				_current = 0;
				_ratio = 0;
				return true;
			}
			return false;
		} else
			_current = index;

		return true;
	};
	this.getCurrentPath = function () {
		return _paths[_paths.length - 1];
	};
	this.setRatio = function(ratio){
		_ratio = ratio;//Math.max(0, Math.min(1, (time - _startTime) / _duration));
		if (_numPaths > 1) {
			index = Math.floor(_ratio * (_numPaths - 1));
			return index >= _numPaths - 1;
		} else {
			return _ratio >= 1;
		}

	};
	this.getCurrentRatio = function () {
		var cR = (_ratio * (_numPaths - 1)) - _current;
		return cR;
	};
	this.getCurrentMorphablePath = function () {
		if (_current < _morphablePathCollection.length)
			return _morphablePathCollection[_current];
		else {
			console.log("Error : something wrong here!");
		}
	};
	this.getShape = function () {
		if (_numPaths > 1)
			return this.currentShape();
		else {
			var path = _paths[0];
			return new MORPH.Shape(path.getSegments());
		}
	};

	this.currentShape = function () {
		var currentMorphablePathGroups = this.getCurrentMorphablePath().morphableGroups;

		var ratio = this.getCurrentRatio();
		var numSegs = currentMorphablePathGroups.length;
		var segs = [];

		for (var i = 0; i < numSegs; i++) {
			var morphableSegmentGroup = currentMorphablePathGroups[i];
			var morphedSegs = morphableSegmentGroup.interpolate(ratio);
			segs = segs.concat(morphedSegs);
		}

		return new MORPH.Shape(segs);
	};
	this.onComplete = function (callback) {
		_onCompleteCallback = callback;
		return this;
	};
	this.setScale = function (scale) {
		for (var i = 0; i < _paths.length; i++) {
			_paths[i].setScale(scale);
		}
		reset();

		return this;
	};
	this.getWidth = function () {
		var w = 0;
		for (var i = 0; i < _paths.length; i++) {
			if (_paths[i].width() > w)
				w = _paths[i].width();
		}
		return w;
	};
	this.getHeight = function () {
		var h = 0;
		for (var i = 0; i < _paths.length; i++) {
			if (_paths[i].height() > h)
				h = _paths[i].height();
		}
		return h;
	};
	this.setPos = function (x, y) {
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

		return this;
	};
	init();
	return this;
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
		morphableGroups.push(new MORPH.MorphableGroup(arr1, arr2));
	}
	return new MORPH.MorphablePath(morphableGroups);
};

MORPH.MorphablePath = function (morphableGroups) {
	return {
		morphableGroups: morphableGroups
	};
};
MORPH.Shape = function (segmentCollection) {
	var _segmentCollection = segmentCollection || [];
	return {
		segmentCollection: _segmentCollection,
		length: segmentCollection.length
	};
};
MORPH.Segment = function (p1, ctrl1, p2, ctrl2) {
	this.pt1 = p1 !== null ? p1.clone() : new MORPH.GEOM.Point();
	this.pt2 = p2 !== null ? p2.clone() : new MORPH.GEOM.Point();
	this.ctrl2 = ctrl2 || this.pt2.clone();
	this.ctrl1 = ctrl1 || this.pt1.clone();

	this.interpolate = function () {
	};

	this.draw = function (p) {
		p.bezier(this.pt1.x, this.pt1.y, this.ctrl1.x, this.ctrl1.y, this.ctrl2.x, this.ctrl2.y, this.pt2.x, this.pt2.y);
	};

	this.translate = function (x, y) {
		//trace("translate : " + x + " : " + y);
		this.pt1.translate(x, y);
		this.pt2.translate(x, y);
		this.ctrl1.translate(x, y);
		this.ctrl2.translate(x, y);
	};

	this.scale = function (scale, regPt) {

		var regPt = regPt || new MORPH.GEOM.Point(0, 0);
		//TODO : scale by registration point

		var ctrlV1 = new MORPH.GEOM.Vector((this.ctrl1.x - this.pt1.x) * scale, (this.ctrl1.y - this.pt1.y) * scale);
		var ctrlV2 = new MORPH.GEOM.Point((this.ctrl2.x - this.pt2.x) * scale, (this.ctrl2.y - this.pt2.y) * scale);

		this.pt1.x *= scale;
		this.pt1.y *= scale;
		this.pt2.x *= scale;
		this.pt2.y *= scale;

		this.ctrl1 = new MORPH.GEOM.Point(this.pt1.x + ctrlV1.x, this.pt1.y + ctrlV1.y);
		this.ctrl2 = new MORPH.GEOM.Point(this.pt2.x + ctrlV2.x, this.pt2.y + ctrlV2.y);

	};
	this.isCurve = function () {
		return !pt1.equals(ctrl1) && !pt2.equals(ctrl2);
	};
	this.clone = function () {
		return new MORPH.Segment(this.pt1.clone(), this.ctrl1.clone(), this.pt2.clone(), this.ctrl2.clone());
	};
};
MORPH.MorphSegment = function (origSeg, destSeg) {
	this.origSeg = origSeg;
	this.destSeg = destSeg;
	this.ctrlV1 = new MORPH.GEOM.Vector(this.destSeg.ctrl1.x - this.origSeg.ctrl1.x, this.destSeg.ctrl1.y - this.origSeg.ctrl1.y);
	this.ctrlV2 = new MORPH.GEOM.Vector(this.destSeg.ctrl2.x - this.origSeg.ctrl2.x, this.destSeg.ctrl2.y - this.origSeg.ctrl2.y);

	this.interpolate = function (percentage) {
		var pt1 = this.origSeg.pt1.Interpolate(this.destSeg.pt1, percentage);
		var pt2 = this.origSeg.pt2.Interpolate(this.destSeg.pt2, percentage);
		var cV = this.ctrlV1.Interpolate(percentage);
		var ctrl1 = new MORPH.GEOM.Point(cV.x + this.origSeg.ctrl1.x, cV.y + this.origSeg.ctrl1.y);
		cV = this.ctrlV2.Interpolate(percentage);
		var ctrl2 = new MORPH.GEOM.Point(cV.x + this.origSeg.ctrl2.x, cV.y + this.origSeg.ctrl2.y);
		return new MORPH.Segment(pt1, ctrl1, pt2, ctrl2);
	};
};