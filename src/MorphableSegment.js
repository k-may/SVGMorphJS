import Segment from './Segment.js';
import {GEOM} from './utils/GeomUtils.js';

export default class MorphableSegment{

    constructor(origSeg, destSeg) {
        this.origSeg = origSeg;
        this.destSeg = destSeg;
        this.ctrlV1 = new GEOM.Vector(this.destSeg.ctrl1.x - this.origSeg.ctrl1.x, this.destSeg.ctrl1.y - this.origSeg.ctrl1.y);
        this.ctrlV2 = new GEOM.Vector(this.destSeg.ctrl2.x - this.origSeg.ctrl2.x, this.destSeg.ctrl2.y - this.origSeg.ctrl2.y);
    }

    interpolate(percentage) {
        var pt1 = GEOM.InterpolatePt(this.origSeg.pt1, this.destSeg.pt1, percentage);
        var pt2 = GEOM.InterpolatePt(this.origSeg.pt2,this.destSeg.pt2, percentage);
        var cV = this.ctrlV1.Interpolate(percentage);
        var ctrl1 = { x : cV.x + this.origSeg.ctrl1.x, y : cV.y + this.origSeg.ctrl1.y};
        cV = this.ctrlV2.Interpolate(percentage);
        var ctrl2 = {x : cV.x + this.origSeg.ctrl2.x, y: cV.y + this.origSeg.ctrl2.y};
        return new Segment(pt1, ctrl1, pt2, ctrl2);
    }

}