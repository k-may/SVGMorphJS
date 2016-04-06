/**
 * Created by kev on 16-04-06.
 */

MORPH.Segment = function (p1, ctrl1, p2, ctrl2) {
	this.pt1 = p1 !== null ? p1.clone() : new MORPH.GEOM.Point();
	this.pt2 = p2 !== null ? p2.clone() : new MORPH.GEOM.Point();
	this.ctrl2 = ctrl2 || this.pt2.clone();
	this.ctrl1 = ctrl1 || this.pt1.clone();
};
MORPH.Segment.prototype = {
	interpolate: function () {
	},
	draw: function (p) {
		p.bezier(this.pt1.x, this.pt1.y, this.ctrl1.x, this.ctrl1.y, this.ctrl2.x, this.ctrl2.y, this.pt2.x, this.pt2.y);
	},
	translate: function (x, y) {
		//trace("translate : " + x + " : " + y);
		this.pt1.translate(x, y);
		this.pt2.translate(x, y);
		this.ctrl1.translate(x, y);
		this.ctrl2.translate(x, y);
	},
	scale: function (scale, regPt) {

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
	},
	isCurve: function () {
		return !pt1.equals(ctrl1) && !pt2.equals(ctrl2);
	},
	clone: function () {
		return new MORPH.Segment(this.pt1.clone(), this.ctrl1.clone(), this.pt2.clone(), this.ctrl2.clone());
	}
};

