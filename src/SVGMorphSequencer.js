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

		_ratio = Math.max(0, Math.min(1, (time - _startTime) / _duration));

		if (_numPaths > 1) {
			index = Math.floor(_ratio * (_numPaths - 1));
			isComplete = index >= _numPaths - 1;
		} else {
			isComplete = _ratio >= 1;
		}

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
		var numGroups = currentMorphablePathGroups.length;
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
MORPH.MorphableGroup = function (origSegs, destSegs) {
	var _origSegs = origSegs || [];
	var _destSegs = destSegs || [];
	var _heteromorphic = origSegs.length != destSegs.length;
	var _maxLength = Math.max(_origSegs.length, _destSegs.length);
	var _segs, _startSegs, _endSegs;
	var _interSeg;

	function init() {
		if (!_heteromorphic) {
			_segs = [];
			if (_destSegs) {
				for (var i = 0; i < _maxLength; i++) {
					_segs.push(new MORPH.MorphSegment(_origSegs[i], _destSegs[i]));
				}
			} else
				_segs = _origSegs;

		} else {

			if (destSegs.length > 1) {
				_interSeg = new MORPH.Segment(_origSegs[0].pt1.Interpolate(_destSegs[0].pt1, 0.5), null, _origSegs[_origSegs.length - 1].pt2.Interpolate(_destSegs[_destSegs.length - 1].pt2, 0.5), null);
			} else {
				_interSeg = _destSegs[0].clone();
			}

			_segs = _startSegs = defineStartInterSegs();
		}
	}

	function defineStartInterSegs() {
		var interSegs = [];
		var percentage, pt1, pt2;
		pt2 = _interSeg.pt1;
		//create array of morph points
		var i = 0;
		while (i < _origSegs.length) {
			percentage = (i + 1) / _origSegs.length;
			pt1 = pt2.clone();
			pt2 = _interSeg.pt1.Interpolate(_interSeg.pt2, percentage);
			var seg = new MORPH.Segment(pt1, null, pt2, null);
			interSegs.push(new MORPH.MorphSegment(_origSegs[i], seg));
			i++;
		}
		return interSegs
	}

	function defineEndInterSegs() {
		var interSegs = [];
		var percentage, pt1, pt2;
		pt2 = _interSeg.pt1;
		//create array of svgMorph points
		var i = 0;
		while (i < _destSegs.length) {
			percentage = (i + 1) / _destSegs.length;
			pt1 = pt2.clone();
			pt2 = _interSeg.pt1.Interpolate(_interSeg.pt2, percentage);
			var seg = new MORPH.Segment(pt1, null, pt2, null);
			interSegs.push(new MORPH.MorphSegment(seg, _destSegs[i]));
			i++;
		}
		return interSegs
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

	this.translate = function (x, y) {

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
	};
	this.interpolate = function (percentage) {
		var segs = [];

		if (_heteromorphic && _destSegs.length > 1)
			percentage = interpolateHetero(percentage);

		//todo interpolate points on curve for more realistic translation

		for (var i = 0; i < _segs.length; i++) {
			segs.push(_segs[i].interpolate(percentage));
		}
		return segs;
	};

	init();
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
MORPH.CanvasUtils = {
	CreateBuffer: function () {

		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");

		return {
			canvas: canvas,
			ctx: ctx,
			width: -1,
			height: -1,
			invalidated: false,
			resize: function (w, h) {
				if (w && h) {
					w = Math.floor(w);
					h = Math.floor(h);

					if (this.width !== w || this.height !== h) {
						this.canvas.width = w;
						this.canvas.height = h;
						this.width = w;
						this.height = h;
						return true;
					}
				}
				return false;
			},
			clear: function () {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			},
			//for debug!
			fill: function (color) {
				this.ctx.fillStyle = color;
				this.ctx.fillRect(0, 0, this.width, this.height);
			},
			getPixelRatio: function () {
				//http://www.html5rocks.com/en/tutorials/canvas/hidpi/
				var devicePixelRatio = window.devicePixelRatio || 1;
				var backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
					this.ctx.mozBackingStorePixelRatio ||
					this.ctx.msBackingStorePixelRatio ||
					this.ctx.oBackingStorePixelRatio ||
					this.ctx.backingStorePixelRatio || 1;

				var ratio = devicePixelRatio / backingStoreRatio;
				return ratio;
			}
		}
	}
};
