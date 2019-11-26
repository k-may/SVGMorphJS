/**
 * Created by kev on 16-04-06.
 */
MORPH.Path = function (obj) {

	this.name = obj.name || "";
	this.id = obj.id || "";
	this._segs = [];
	this._points = [];
	this._rect;
	this._x = 0;
	this._y = 0;

	var _d = this._d = obj.d;
	var bb = new MORPH.BoundingBox();

	var self = this;
	var addPoint = function (x, y) {
		var p = new MORPH.GEOM.Point(x, y);
		if (!isFirstPoint()) {
			addLineSegment(getLastPoint(), p);
		}
		self._points.push(p);
	};
	var addCurvePoint = function (ctrl1, ctrl2, pt2) {
		var pt1 = getLastPoint();
		addSegment(pt1, ctrl1, pt2, ctrl2);
		self._points.push(pt2);
	};
	var addLineSegment = function (p1, p2) {
		self._segs.push(new MORPH.Segment(p1, p1, p2, p2));
	};
	var addSegment = function (p1, c1, p2, c2) {
		self._segs.push(new MORPH.Segment(p1, c1, p2, c2));
	};
	var getLastPoint = function () {
		return self._points[self._points.length - 1].clone();
	};
	var isFirstPoint = function () {
		return self._points.length == 0;
	};

	_d = _d.replace(/,/gm, ' ');
	// get rid of all commas
	_d = _d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2');
	// separate commands from commands
	_d = _d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2');
	// separate commands from commands
	_d = _d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm, '$1 $2');
	// separate commands from points
	_d = _d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2');
	// separate commands from points
	_d = _d.replace(/([0-9])([+\-])/gm, '$1 $2');
	// separate digits when no comma
	_d = _d.replace(/(\.[0-9]*)(\.)/gm, '$1 $2');
	// separate digits when no comma
	_d = _d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm, '$1 $3 $4 ');
	// shorthand elliptical arc path syntax
	//_d = svg.compressSpaces(_d);
	_d = _d.replace(/[\s\r\t\n]+/gm, ' ');
	// compress multiple spaces
	_d = _d.replace(/^\s+|\s+$/g, '');

	var pp = new MORPH.PATH.PathParser(_d);
	pp.reset();

	while (!pp.isEnd()) {
		pp.nextCommand();
		switch (pp.command) {
			case 'M':
			case 'm':
				var p = pp.getAsCurrentPoint();
				pp.addMarker(p);
				addPoint(p.x, p.y);
				bb.addPoint(p.x, p.y);

				pp.start = pp.current;
				while (!pp.isCommandOrEnd()) {
					var p = pp.getAsCurrentPoint();
					pp.addMarker(p, pp.start);
					addPoint(p.x, p.y);
					bb.addPoint(p.x, p.y);
				}
				break;
			case 'L':
			case 'l':
				while (!pp.isCommandOrEnd()) {
					var c = pp.current;
					var p = pp.getAsCurrentPoint();
					pp.addMarker(p, c);
					addPoint(p.x, p.y);
					bb.addPoint(p.x, p.y);
				}
				break;
			case 'H':
			case 'h':
				while (!pp.isCommandOrEnd()) {
					var newP = new MORPH.GEOM.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
					pp.addMarker(newP, pp.current);
					pp.current = newP;
					addPoint(newP.x, newP.y);
					bb.addPoint(pp.current.x, pp.current.y);
				}
				break;
			case 'V':
			case 'v':
				while (!pp.isCommandOrEnd()) {
					var newP = new MORPH.GEOM.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
					pp.addMarker(newP, pp.current);
					pp.current = newP;
					addPoint(newP.x, newP.y);
					bb.addPoint(pp.current.x, pp.current.y);
				}
				break;
			case 'C':
			case 'c':
				while (!pp.isCommandOrEnd()) {
					var curr = pp.current;
					var p1 = pp.getPoint();
					var cntrl = pp.getAsControlPoint();
					var cp = pp.getAsCurrentPoint();
					pp.addMarker(cp, cntrl, p1);
					addCurvePoint(new MORPH.GEOM.Point(p1.x, p1.y), new MORPH.GEOM.Point(cntrl.x, cntrl.y), new MORPH.GEOM.Point(cp.x, cp.y));
					bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
				}
				break;
			case 'S':
			case 's':
				while (!pp.isCommandOrEnd()) {
					var curr = pp.current;
					var p1 = pp.getReflectedControlPoint();
					var cntrl = pp.getAsControlPoint();
					var cp = pp.getAsCurrentPoint();
					pp.addMarker(cp, cntrl, p1);
					addCurvePoint(new MORPH.GEOM.Point(p1.x, p1.y), new MORPH.GEOM.Point(cntrl.x, cntrl.y), new MORPH.GEOM.Point(cp.x, cp.y));
					bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
				}
				break;
			case 'Q':
			case 'q':
				while (!pp.isCommandOrEnd()) {
					var curr = pp.current;
					var cntrl = pp.getAsControlPoint();
					var cp = pp.getAsCurrentPoint();
					pp.addMarker(cp, cntrl, cntrl);
					addCurvePoint(new MORPH.GEOM.Point(p1.x, p1.y), new MORPH.GEOM.Point(cntrl.x, cntrl.y), new MORPH.GEOM.Point(cp.x, cp.y));
					bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
				}
				break;
			case 'T':
			case 't':
				while (!pp.isCommandOrEnd()) {
					var curr = pp.current;
					var cntrl = pp.getReflectedControlPoint();
					pp.control = cntrl;
					var cp = pp.getAsCurrentPoint();
					pp.addMarker(cp, cntrl, cntrl);
					addCurvePoint(new MORPH.GEOM.Point(p1.x, p1.y), new MORPH.GEOM.Point(cntrl.x, cntrl.y), new MORPH.GEOM.Point(cp.x, cp.y));
					bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
				}
				break;
			case 'A':
			case 'a':
				while (!pp.isCommandOrEnd()) {
					var curr = pp.current;
					var rx = pp.getScalar();
					var ry = pp.getScalar();
					var xAxisRotation = pp.getScalar() * (Math.PI / 180.0);
					var largeArcFlag = pp.getScalar();
					var sweepFlag = pp.getScalar();
					var cp = pp.getAsCurrentPoint();

					//todo get this to work...

					// Conversion from endpoint to center parameterization
					// http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes

					//or try https://github.com/paperjs/paper.js/blob/develop/src/path/Path.js#L2447

					// x1', y1'
					var currp = new MORPH.GEOM.Point(Math.cos(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2.0, -Math.sin(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2.0);
					// adjust radii
					var l = Math.pow(currp.x, 2) / Math.pow(rx, 2) + Math.pow(currp.y, 2) / Math.pow(ry, 2);
					if (l > 1) {
						rx *= Math.sqrt(l);
						ry *= Math.sqrt(l);
					}
					// cx', cy'
					var s = (largeArcFlag == sweepFlag ? -1 : 1) * Math.sqrt(((Math.pow(rx, 2) * Math.pow(ry, 2)) - (Math.pow(rx, 2) * Math.pow(currp.y, 2)) - (Math.pow(ry, 2) * Math.pow(currp.x, 2))) / (Math.pow(rx, 2) * Math.pow(currp.y, 2) + Math.pow(ry, 2) * Math.pow(currp.x, 2)));
					if (isNaN(s))
						s = 0;
					var cpp = new MORPH.GEOM.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx);
					// cx, cy
					var centp = new MORPH.GEOM.Point((curr.x + cp.x) / 2.0 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y, (curr.y + cp.y) / 2.0 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y);
					// vector magnitude
					var m = function (v) {
						return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
					}
					// ratio between two vectors
					var r = function (u, v) {
						return (u[0] * v[0] + u[1] * v[1]) / (m(u) * m(v))
					}
					// angle between two vectors
					var a = function (u, v) {
						return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(r(u, v));
					}
					// initial angle
					var a1 = a([1, 0], [(currp.x - cpp.x) / rx, (currp.y - cpp.y) / ry]);
					// angle delta
					var u = [(currp.x - cpp.x) / rx, (currp.y - cpp.y) / ry];
					var v = [(-currp.x - cpp.x) / rx, (-currp.y - cpp.y) / ry];
					var ad = a(u, v);
					if (r(u, v) <= -1)
						ad = Math.PI;
					if (r(u, v) >= 1)
						ad = 0;

					if (sweepFlag == 0 && ad > 0)
						ad = ad - 2 * Math.PI;
					if (sweepFlag == 1 && ad < 0)
						ad = ad + 2 * Math.PI;

					// for markers
					var halfWay = new MORPH.GEOM.Point(centp.x + rx * Math.cos((a1 + (a1 + ad)) / 2), centp.y + ry * Math.sin((a1 + (a1 + ad)) / 2));
					pp.addMarkerAngle(halfWay, (a1 + (a1 + ad)) / 2 + (sweepFlag == 0 ? -1 : 1) * Math.PI / 2);
					pp.addMarkerAngle(cp, (a1 + ad) + (sweepFlag == 0 ? -1 : 1) * Math.PI / 2);

					addPoint(halfWay.x, halfWay.y);
					addPoint(cp.x, cp.y);

					bb.addPoint(cp.x, cp.y);
				}
				break;
			case 'Z':
			case 'z':
				pp.current = pp.start;
				addPoint(pp.start.x, pp.start.y);
		}
	}
};

MORPH.Path.prototype = {
	clone: function () {
		var p = new MORPH.Path({d: this._d});
		p.setRectangle(this._rect.clone());
		p.name = this.name;
		return p;
	},
	translate: function (x, y) {
		this._x = x;
		this._y = y;
		for (var i = 0; i < this._segs.length; i++) {
			var seg = this._segs[i];
			seg.translate(x, y);
		}
		this._rect.translate(x, y);
	},
	setScale: function (scaleX, scaleY) {
		scaleY = scaleY || scaleX;
		for (var i = 0; i < this._segs.length; i++) {
			var seg = this._segs[i];
			seg.scale(scaleX, scaleY, new MORPH.GEOM.Point(0, 0));
		}
		this._rect.scale(scaleX, scaleY);
	},
	setRectangle: function (rect) {
		this._rect = rect;
	},
	width: function () {
		return this._rect.width();
	},
	height: function () {
		return this._rect.height();
	},
	/*setSegments: function (segs) {
		var segments = [];
		for (var i = 0; i < segs.length; i++) {
			segments = segs[i].clone();
		}
	},*/
	getSegments: function () {
		//trace("return :" + _segs.length);
		var segments = [];
		for (var i = 0; i < this._segs.length; i++) {
			segments.push(this._segs[i].clone());
		}
		return segments;
	},

	getPosition : function(){
		return new MORPH.GEOM.Point(this._x, this._y);
	}

	/*var getCurrentSegment = function () {
	 return _currentSegment;
	 };
	 var isEndOfLine = function () {
	 return !isFirstPoint();
	 };
	 var isDuplicate = function (pt) {
	 if (isFirstPoint()) {
	 return false;
	 }
	 return getLastPoint().equals(pt);
	 };*/
	/*getMarkers: function () {
		var points = this.PathParser.getMarkerPoints();
		var angles = this.PathParser.getMarkerAngles();

		var markers = [];
		for (var i = 0; i < points.length; i++) {
			markers.push([points[i], angles[i]]);
		}
		return markers;
	}*/
};