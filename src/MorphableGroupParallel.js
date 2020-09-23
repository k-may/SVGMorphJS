import MorphableGroup from './MorphableGroup.js';
import MorphableSegment from './MorphableSegment.js';

export default class MorphableGroupParallel extends MorphableGroup{

    init() {
        this._segs = [];
        if (this._destSegs) {
            for (var i = 0; i < this._maxLength; i++) {
                this._segs.push(new MorphableSegment(this._origSegs[i], this._destSegs[i]));
            }
        } else
            this._segs = this._origSegs;
    }
}