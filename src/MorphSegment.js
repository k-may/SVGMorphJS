/**
 * Created by kev on 16-04-06.
 */
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