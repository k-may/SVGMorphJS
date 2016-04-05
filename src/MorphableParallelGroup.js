/**
 * Created by kev on 16-03-23.
 */
MORPH.MorphableGroupParallel = (function () {

	var MorphableGroupParallel = function () {
		MORPH.MorphableGroup.apply(this, arguments);
	};
	MorphableGroupParallel.prototype = Object.create(MORPH.MorphableGroup.prototype);
	MorphableGroupParallel.constructor = MORPH.MorphableGroup;
	MorphableGroupParallel.prototype.init = function () {
		this._segs = [];
		if (this._destSegs) {
			for (var i = 0; i < this._maxLength; i++) {
				this._segs.push(new MORPH.MorphSegment(this._origSegs[i], this._destSegs[i]));
			}
		} else
			this._segs = this._origSegs;
	};

	return MorphableGroupParallel;
})();
