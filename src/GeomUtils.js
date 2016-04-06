/**
 * Created by kev on 16-04-06.
 */
MORPH.GEOM = {
	Rectangle  :function (x,y,width,height) {
		this.x1 = x;
		this.y1 = y;
		this.w = width;
		this.h = height;

		this.width = function () {
			return this.w;
		};

		this.height = function () {
			return this.h;
		};

		this.scale = function (scale) {
			this.w = this.w * scale;
			this.h = this.h * scale;
		};

		this.translate = function (x,y) {
			this.x1 += x;
			this.y1 += y;
		};

		this.clone = function () {
			return new MORPH.GEOM.Rectangle(this.x1,this.y1,this.w,this.h);
		};
	},
	Point      :function (x,y) {
		this.x = x || 0;
		this.y = y || 0;

		this.draw = function (p) {
			p.ellipse(this.x,this.y,10,10);
		};

		this.clone = function () {
			var x = this.x;
			var y = this.y;
			return new MORPH.GEOM.Point(x,y);
		};

		this.equals = function (pt) {
			return (this.x == pt.x && this.y == pt.y);
		};

		this.trace = function () {
			return "{" + this.x + "," + this.y + "}";
		};
		this.applyTransform = function (v) {
			var xp = this.x * v[0] + this.y * v[2] + v[4];
			var yp = this.x * v[1] + this.y * v[3] + v[5];
			this.x = xp;
			this.y = yp;
		};
		this.angleTo = function (p) {
			return Math.atan2(p.y - this.y,p.x - this.x);
		};

		this.Interpolate = function (pt2,percentage) {
			var newX = this.x + (pt2.x - this.x) * percentage;
			var newY = this.y + (pt2.y - this.y) * percentage;
			return new MORPH.GEOM.Point(newX,newY);
		};
		this.translate = function (tX,tY) {
			var pX = this.x + tX;
			var pY = this.y + tY;
			this.x = pX;
			this.y = pY;
		};
	},
	RandomPoint:function (width,height) {
		var newX = Math.random() * width;
		var newY = Math.random() * height;
		return new MORPH.GEOM.Point(newX,newY);
	},
	Vector     :function (x,y) {
		this.x = x || 0;
		this.y = y || 0;

		this.Interpolate = function (percentage) {
			return new MORPH.GEOM.Vector(this.x * percentage,this.y * percentage);
		};
	}
};
