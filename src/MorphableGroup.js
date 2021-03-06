import Segment from './Segment.js';
import {GEOM} from './utils/GeomUtils.js';
import MorphableSegment from './MorphableSegment.js';

export default class MorphableGroup {
    constructor(origSegs, destSegs) {
        this._origSegs = origSegs || [];
        this._destSegs = destSegs || [];
        this._heteromorphic = origSegs.length != destSegs.length;
        this._maxLength = Math.max(this._origSegs.length, this._destSegs.length);
        this._segs;
        this._startSegs;
        this._endSegs;
        this._interSeg;

        this.init();
    }

    init() {
        /*if (!this._heteromorphic) {
         this._segs = [];
         if (this._destSegs) {
         for (var i = 0; i < this._maxLength; i++) {
         this._segs.push(new SVGMORPH.MorphSegment(this._origSegs[i], this._destSegs[i]));
         }
         } else
         this._segs = this._origSegs;

         } else {
         */
        if (this._destSegs.length > 1) {
            this._interSeg = new Segment(
                GEOM.InterpolatePt(this._origSegs[0].pt1, this._destSegs[0].pt1, 0.5),
                null,
                GEOM.InterpolatePt(this._origSegs[this._origSegs.length - 1].pt2, this._destSegs[this._destSegs.length - 1].pt2, 0.5),
                null);
        } else {
            this._interSeg = this._destSegs[0].clone();
        }

        this._segs = this._startSegs = this.defineStartInterSegs();
        //}
    }

    defineStartInterSegs() {
        var interSegs = [];
        var percentage, pt1, pt2;
        pt2 = this._interSeg.pt1;
        //create array of morph points
        var i = 0;
        while (i < this._origSegs.length) {
            percentage = (i + 1) / this._origSegs.length;
            pt1 = {x: pt2.x, y: pt2.y};
            pt2 = GEOM.InterpolatePt(this._interSeg.pt1, this._interSeg.pt2, percentage);
            var seg = new Segment(pt1, null, pt2, null);
            interSegs.push(new MorphableSegment(this._origSegs[i], seg));
            i++;
        }
        return interSegs
    }

    defineEndInterSegs() {
        var interSegs = [];
        var percentage, pt1, pt2;
        pt2 = this._interSeg.pt1;
        //create array of svgMorph points
        var i = 0;
        while (i < this._destSegs.length) {
            percentage = (i + 1) / this._destSegs.length;
            pt1 = {x: pt2.x, y: pt2.y};
            pt2 = GEOM.InterpolatePt(this._interSeg.pt1, this._interSeg.pt2, percentage);
            var seg = new Segment(pt1, null, pt2, null);
            interSegs.push(new MorphableSegment(seg, this._destSegs[i]));
            i++;
        }
        return interSegs
    }

    interpolateHetero(percentage) {
        if (percentage >= 0.5) {
            if (!this._endSegs) {
                this._endSegs = this.defineEndInterSegs(this._interSeg.pt1, this._destSegs);
            }
            this._segs = this._endSegs;
        } else {
            this._segs = this._startSegs;
        }

        return percentage < 0.5 ? percentage / 0.5 : (percentage - 0.5) / 0.5;
    }

    translate(x, y) {

        function setSegmentPos(segArray, x, y) {
            var i = 0;
            for (var i = 0; i < segArray.length; i++) {
                segArray[i].translate(x, y);
            }
        }

        setSegmentPos(this._origSegs, x, y);
        if (this._destSegs) {
            setSegmentPos(this._destSegs, x, y);
        }

        this.init();
    }

    interpolate(percentage) {
        var segs = [];

        if (this._heteromorphic && this._destSegs.length > 1) {
            percentage = this.interpolateHetero(percentage);
        }

        //todo interpolate points on curve for more realistic translation

        for (var i = 0; i < this._segs.length; i++) {
            segs.push(this._segs[i].interpolate(percentage));
        }
        return segs;
    }
}