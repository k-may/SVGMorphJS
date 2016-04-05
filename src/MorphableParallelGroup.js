/**
 * Created by kev on 16-03-23.
 */
MORPH.MorphableGroupParallel = (function () {

	var MorphableGroupParallel = function () {
		this._origSegs = origSegs || [];
		this._destSegs = destSegs || [];
		this._heteromorphic = false;
		this._maxLength = Math.max(this._origSegs.length, this._destSegs.length);
		this._segs;
		this._startSegs;
		this._endSegs;
		this._interSeg;
	};
	MorphableGroupParallel.prototype = MORPH.MorphableGroup.prototype;
	MorphableGroupParallel.prototype.init = function () {

	};

	return MorphableGroupParallel;
})();
MORPH.MorphableGroupParallel.prototype = MORPH.MorphableGroup.prototype;
/*
MORPH.MorphableGroupParallel.prototype.init = function () {

};
*/
