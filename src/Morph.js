/**
 * Created by kev on 16-04-06.
 */
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
	this._paths = paths;
	this._current = 0;
	this._morphablePathCollection = [];
	this._ratio = 0;
	this._startTime;
	this._duration = obj["duration"] || 1000;
	this._delayTime = 0;
	this._looping = obj["looping"] || false;
	this._numPaths = _looping ? this._paths.length + 1 : this._paths.length;
	this._completeCallback = obj["onComplete"];
	this._x = 0;
	this._y = 0;

	this.reset();
};
MORPH.Morph.prototype = {
	reset: function () {
		var i = 0;
		if (this._numPaths > 1) {
			this._morphablePathCollection = [];
			while (this._morphablePathCollection.length < this._numPaths - 1) {
				var Morphables = MORPH.createMorphablePath(this._paths[i].getSegments(), this._paths[(i + 1) % this._paths.length].getSegments());
				this._morphablePathCollection.push(Morphables);
				i++;
			}
		} else {
			this._morphablePathCollection.push(_paths[0]);
		}
	},
	start: function
		(time) {
		this._startTime = time !== undefined ? time : window.performance.now();
		this._startTime += _delayTime;
		MORPH.add(this);

		return this;
	},
	update: function (time) {
		var isComplete, index = 0;

		//todo test this!
		/*_ratio = Math.max(0, Math.min(1, (time - _startTime) / _duration));

		 if (_numPaths > 1) {
		 index = Math.floor(_ratio * (_numPaths - 1));
		 isComplete = index >= _numPaths - 1;
		 } else {
		 isComplete = _ratio >= 1;
		 }*/

		var r = Math.max(0, Math.min(1, (time - this._startTime) / this._duration));
		isComplete = this.setRatio(r);

		if (isComplete) {

			if (this._completeCallback != null)
				this._completeCallback();

			if (this._looping) {
				this._startTime = time !== undefined ? time : window.performance.now();
				this._current = 0;
				this._ratio = 0;
				return true;
			}
			return false;
		} else
			this._current = index;

		return true;
	},
	getCurrentPath: function () {
		return this._paths[this._paths.length - 1];
	},
	setRatio: function (ratio) {
		this._ratio = ratio;//Math.max(0, Math.min(1, (time - _startTime) / _duration));
		if (this._numPaths > 1) {
			index = Math.floor(this._ratio * (this._numPaths - 1));
			return index >= this._numPaths - 1;
		} else {
			return this._ratio >= 1;
		}

	},
	getCurrentRatio: function () {
		var cR = (this._ratio * (this._numPaths - 1)) - this._current;
		return cR;
	},
	getCurrentMorphablePath: function () {
		if (this._current < this._morphablePathCollection.length)
			return this._morphablePathCollection[this._current];
		else {
			console.log("Error : something wrong here!");
		}
	},
	getShape: function () {
		if (this._numPaths > 1)
			return this.currentShape();
		else {
			var path = this._paths[0];
			return new MORPH.Shape(path.getSegments());
		}
	},
	currentShape: function () {
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
	},
	onComplete: function (callback) {
		this._onCompleteCallback = callback;
		return this;
	},
	setScale: function (scale) {
		for (var i = 0; i < this._paths.length; i++) {
			this._paths[i].setScale(scale);
		}
		reset();

		return this;
	},
	getWidth: function () {
		var w = 0;
		for (var i = 0; i < this._paths.length; i++) {
			if (this._paths[i].width() > w)
				w = this._paths[i].width();
		}
		return w;
	},
	getHeight: function () {
		var h = 0;
		for (var i = 0; i < _paths.length; i++) {
			if (this._paths[i].height() > h)
				h = this._paths[i].height();
		}
		return h;
	},
	setPos: function (x, y) {
		this._x = x;
		this._y = y;
		var i = 0;
		while (i < this._paths.length) {
			var path = this._paths[i];
			path.translate(x, y);
			i++;
		}

		return this;
	},
	setOrigin: function (x, y) {
		var dX = x - this._x;
		var dY = y - this._y;
		var i = 0;
		while (i < this._paths.length) {
			this._paths[i++].translate(dX, dY);
		}
	}
};
