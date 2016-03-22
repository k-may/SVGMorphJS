var MorphDrawer = function(length, colors, strokeWeight) {
	this.shapeArr = new Array();

	var l = length;
	var _strokeWeight = strokeWeight || 1;
	var _colors = colors || [new Color(0, 0, 0)];

	this.addShape = function(shape) {
		if (this.shapeArr.length >= l)
			this.shapeArr.pop();

		this.shapeArr.unshift(shape);
	}

	this.draw = function(p) {
		var percentage;
		var shape, segCol;
		var morphObjLength, segsLength;
		var shapeLength = this.shapeArr.length;
		var color;
		for (var j = 0; j < shapeLength; j++) {
			percentage = j / l;
			//percentage *= percentage;
			p.strokeWeight(_strokeWeight);
			color = getColor(j);
			p.stroke(color.r, color.g, color.b, color.a);
			shape = this.shapeArr[j];
			for (var i = 0; i < shape.length; i++) {
				var seg = shape.segmentCollection[i];
				seg.draw(p);
			}

		}
	}
	function getColor(index) {
		index = Math.min(_colors.length - 1, index);
		return _colors[index];
	}

}

MORPH.GEOM = {
	Rectangle: function (x, y, width, height) {
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

		this.translate = function (x, y) {
			this.x1 += x;
			this.y1 += y;
		};

		this.clone = function () {
			return new MORPH.GEOM.Rectangle(this.x1, this.y1, this.w, this.h);
		};
	},
	Point: function (x, y) {
		this.x = x || 0;
		this.y = y || 0;

		this.draw = function (p) {
			p.ellipse(this.x, this.y, 10, 10);
		};

		this.clone = function () {
			var x = this.x;
			var y = this.y;
			return new MORPH.GEOM.Point(x, y);
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
			return Math.atan2(p.y - this.y, p.x - this.x);
		};

		this.Interpolate = function (pt2, percentage) {
			var newX = this.x + (pt2.x - this.x) * percentage;
			var newY = this.y + (pt2.y - this.y) * percentage;
			return new MORPH.GEOM.Point(newX, newY);
		};
		this.translate = function (tX, tY) {
			var pX = this.x + tX;
			var pY = this.y + tY;
			this.x = pX;
			this.y = pY;
		};
	},
	RandomPoint: function (width, height) {
		var newX = Math.random() * width;
		var newY = Math.random() * height;
		return new MORPH.GEOM.Point(newX, newY);
	},
	Vector: function (x, y) {
		this.x = x || 0;
		this.y = y || 0;

		this.Interpolate = function (percentage) {
			return new MORPH.GEOM.Vector(this.x * percentage, this.y * percentage);
		};
	}
};

/**
 * Returns normalized paths
 *
 * @param paths
 * @param callback
 * @constructor
 */
MORPH.LoadSVG = function (paths, callback) {
	var svgPaths = [];
	var documents = [];

	function loaded(data) {
		var bb = MORPH.SVG.getBoundingBox(data[0]);
		for (var i = 0; i < data.length; i++) {
			var svg = data[i].getElementsByTagName('svg')[0];
			var id = svg.getAttribute("id");
			var pathData = MORPH.SVG.getPathStrings(data[i]);
			for (var p = 0; p < pathData.length; p++) {
				var path = new MORPH.PATH.Path({
					id : id + "_" + p,
					d : pathData[p]
				});
				path.setRectangle(bb.clone());
				svgPaths.push(path);
			}
		}
		callback(svgPaths);
	}

	function loadHandler(data) {
		documents.push(data);
		if (paths.length) {
			load(paths.shift());
		} else {
			loaded(documents);
		}
	}

	function load(path) {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				loadHandler(xhttp.responseXML);
			}
		};
		xhttp.open("GET", path, true);
		xhttp.send();
	}

	load(paths.shift());
};
MORPH.SVG = {
	getBoundingBox: function (data) {
		var svg = data.getElementsByTagName('svg')[0];
		var attributes = svg.attributes;
		var x = MORPH.SVG.getNodeValue(attributes, "x");
		var y = MORPH.SVG.getNodeValue(attributes, "y");
		var width = MORPH.SVG.getNodeValue(attributes, "width") || 100;
		var height = MORPH.SVG.getNodeValue(attributes, "height") || 100;
		//trace("PAth BB : x:" + x + " y:" + y + " width:" + width + " height:" + height);
		return new MORPH.GEOM.Rectangle(x, y, width, height);
	},
	getNodeValue: function (attributes, name) {
		if (attributes[name]) {
			return parseInt(attributes[name].nodeValue);
		}
		return null;
	},
	getPathStrings: function (svg) {
		var i, arr = [];

		var paths = svg.getElementsByTagName('path');
		for (i = 0; i < paths.length; i++) {
			arr.push(paths[i].getAttribute('d'));
		}

		var lines = svg.getElementsByTagName('line');
		for (i = 0; i < lines.length; i++) {
			var x1 = lines[i].getAttribute('x1');
			var x2 = lines[i].getAttribute('x2');
			var y1 = lines[i].getAttribute('y1');
			var y2 = lines[i].getAttribute('y2');
			arr.push("M" + x1 + " " + y1 + " L" + x2 + " " + y2);
		}

		//todo convert all primitives to paths
		//for other conversions see : https://github.com/JFXtras/jfxtras-labs/blob/2.2/src/main/java/jfxtras/labs/util/ShapeConverter.java

		return arr;
	}
};

MORPH.PATH = {
	BoundingBox: function (x1, y1, x2, y2) {// pass in initial points if you want
		this.x1 = Number.NaN;
		this.y1 = Number.NaN;
		this.x2 = Number.NaN;
		this.y2 = Number.NaN;

		this.scale = function (scale) {
			this.x2 = this.x1 + this.width() * scale;
			this.y2 = this.y1 + this.height() * scale;
		};

		this.x = function () {
			return this.x1;
		};
		this.y = function () {
			return this.y1;
		};
		this.width = function () {
			return this.x2 - this.x1;
		};
		this.height = function () {
			return this.y2 - this.y1;
		};

		this.addPoint = function (x, y) {
			if (x != null) {
				if (isNaN(this.x1) || isNaN(this.x2)) {
					this.x1 = x;
					this.x2 = x;
				}
				if (x < this.x1)
					this.x1 = x;
				if (x > this.x2)
					this.x2 = x;
			}

			if (y != null) {
				if (isNaN(this.y1) || isNaN(this.y2)) {
					this.y1 = y;
					this.y2 = y;
				}
				if (y < this.y1)
					this.y1 = y;
				if (y > this.y2)
					this.y2 = y;
			}
		};
		this.addX = function (x) {
			this.addPoint(x, null);
		};
		this.addY = function (y) {
			this.addPoint(null, y);
		};

		this.addBoundingBox = function (bb) {
			this.addPoint(bb.x1, bb.y1);
			this.addPoint(bb.x2, bb.y2);
		};
		this.addQuadraticCurve = function (p0x, p0y, p1x, p1y, p2x, p2y) {
			var cp1x = p0x + 2 / 3 * (p1x - p0x);
			// CP1 = QP0 + 2/3 *(QP1-QP0)
			var cp1y = p0y + 2 / 3 * (p1y - p0y);
			// CP1 = QP0 + 2/3 *(QP1-QP0)
			var cp2x = cp1x + 1 / 3 * (p2x - p0x);
			// CP2 = CP1 + 1/3 *(QP2-QP0)
			var cp2y = cp1y + 1 / 3 * (p2y - p0y);
			// CP2 = CP1 + 1/3 *(QP2-QP0)
			this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y, cp2y, p2x, p2y);
		};
		this.addBezierCurve = function (p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
			// from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
			var p0 = [p0x, p0y], p1 = [p1x, p1y], p2 = [p2x, p2y], p3 = [p3x, p3y];
			this.addPoint(p0[0], p0[1]);
			this.addPoint(p3[0], p3[1]);

			for (i = 0; i <= 1; i++) {
				var f = function (t) {
					return Math.pow(1 - t, 3) * p0[i] + 3 * Math.pow(1 - t, 2) * t * p1[i] + 3 * (1 - t) * Math.pow(t, 2) * p2[i] + Math.pow(t, 3) * p3[i];
				};
				var b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
				var a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
				var c = 3 * p1[i] - 3 * p0[i];

				if (a == 0) {
					if (b == 0)
						continue;
					var t = -c / b;
					if (0 < t && t < 1) {
						if (i == 0)
							this.addX(f(t));
						if (i == 1)
							this.addY(f(t));
					}
					continue;
				}

				var b2ac = Math.pow(b, 2) - 4 * c * a;
				if (b2ac < 0)
					continue;
				var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
				if (0 < t1 && t1 < 1) {
					if (i == 0)
						this.addX(f(t1));
					if (i == 1)
						this.addY(f(t1));
				}
				var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
				if (0 < t2 && t2 < 1) {
					if (i == 0)
						this.addX(f(t2));
					if (i == 1)
						this.addY(f(t2));
				}
			}
		};
		this.isPointInBox = function (x, y) {
			return (this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2);
		};

		this.addPoint(x1, y1);
		this.addPoint(x2, y2);
	},
	PathParser: function (d) {
		//console.log("d ===! : " + d);
		var _d = d || "";
		this.tokens = _d.split(' ');
		//console.dir(this.tokens);

		this.reset = function () {
			this.i = -1;
			this.command = '';
			this.previousCommand = '';
			this.start = new MORPH.GEOM.Point(0, 0);
			this.control = new MORPH.GEOM.Point(0, 0);
			this.current = new MORPH.GEOM.Point(0, 0);
			this.points = [];
			this.angles = [];
		};
		this.isEnd = function () {
			return this.i >= this.tokens.length - 1;
		};
		this.isCommandOrEnd = function () {
			if (this.isEnd())
				return true;
			return this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null;
		};
		this.isRelativeCommand = function () {
			switch (this.command) {
				case 'm':
				case 'l':
				case 'h':
				case 'v':
				case 'c':
				case 's':
				case 'q':
				case 't':
				case 'a':
				case 'z':
					return true;
					break;
			}
			return false;
		};
		this.getToken = function () {
			this.i++;
			return this.tokens[this.i];
		};
		this.getScalar = function () {
			return parseFloat(this.getToken());
		};
		this.nextCommand = function () {
			this.previousCommand = this.command;
			this.command = this.getToken();
		};
		this.getPoint = function () {
			var p = new MORPH.GEOM.Point(this.getScalar(), this.getScalar());
			return this.makeAbsolute(p);
		};
		this.getAsControlPoint = function () {
			var p = this.getPoint();
			this.control = p;
			return p;
		};
		this.getAsCurrentPoint = function () {
			var p = this.getPoint();
			this.current = p;
			return p;
		};
		this.getReflectedControlPoint = function () {
			if (this.previousCommand.toLowerCase() != 'c' && this.previousCommand.toLowerCase() != 's') {
				return this.current;
			}
			// reflect point
			return new MORPH.GEOM.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);
		};
		this.makeAbsolute = function (p) {
			if (this.isRelativeCommand()) {
				p.x += this.current.x;
				p.y += this.current.y;
			}
			return p;
		};

		this.addMarker = function (p, from, priorTo) {
			// if the last angle isn't filled in because we didn't have this point yet ...
			if (priorTo != null && this.angles.length > 0 && this.angles[this.angles.length - 1] == null) {
				this.angles[this.angles.length - 1] = this.points[this.points.length - 1].angleTo(priorTo);
			}
			this.addMarkerAngle(p, from == null ? null : from.angleTo(p));
		};

		this.addMarkerAngle = function (p, a) {
			this.points.push(p);
			this.angles.push(a);
		};

		this.getMarkerPoints = function () {
			return this.points;
		};
		this.getMarkerAngles = function () {
			for (var i = 0; i < this.angles.length; i++) {
				if (this.angles[i] == null) {
					for (var j = i + 1; j < this.angles.length; j++) {
						if (this.angles[j] != null) {
							this.angles[i] = this.angles[j];
							break;
						}
					}
				}
			}
			return this.angles;
		}
	},
	Path: function (obj) {
		//var i,_currentSegment;

		this.id = obj.id || "";
		var _d = obj.d;
		var _segs = [];
		var _points = [];
		var _rect;
		var bb = new MORPH.PATH.BoundingBox();

		this.clone = function () {
			var p = new Path({d: _d});
			p.setRectangle(_rect.clone());
			p.name = this.name;
			return p;
		};

		this.translate = function (x, y) {
			for (var i = 0; i < _segs.length; i++) {
				var seg = _segs[i];
				seg.translate(x, y);
			}
			_rect.translate(x, y);
		};
		this.setScale = function (scale) {
			//trace("set scale : " + scale);
			for (var i = 0; i < _segs.length; i++) {
				var seg = _segs[i];
				seg.scale(scale, new Point(0, 0));
			}
			_rect.scale(scale);
		};
		this.setRectangle = function (rect) {
			_rect = rect;
		};

		this.width = function () {
			return _rect.width();
		};

		this.height = function () {
			return _rect.height();
		};

		this.setSegments = function (segs) {
			var segments = [];
			for (var i = 0; i < segs.length; i++) {
				segments = segs[i].clone();
			}
		};

		this.getSegments = function () {
			//trace("return :" + _segs.length);
			var segments = [];
			for (var i = 0; i < _segs.length; i++) {
				segments.push(_segs[i].clone());
			}
			return segments;
		};
		var getLastPoint = function () {
			return _points[_points.length - 1].clone();
		};
		var isFirstPoint = function () {
			return _points.length == 0;
		};
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
		var addPoint = function (x, y) {
			var p = new MORPH.GEOM.Point(x, y);
			if (!isFirstPoint()) {
				addLineSegment(getLastPoint(), p);
			}
			_points.push(p);
			//trace("add point -->" + x + " : " + y + "/" + _points.length);
		};
		var addCurvePoint = function (ctrl1, ctrl2, pt2) {
			var pt1 = getLastPoint();
			addSegment(pt1, ctrl1, pt2, ctrl2);
			_points.push(pt2);
			//trace("add point -->" + pt2.x + " : " + pt2.y + "/" + _points.length);

		};
		var addLineSegment = function (p1, p2) {
			_segs.push(new MORPH.Segment(p1, p1, p2, p2));
			//trace("add line :" + p1.x + "/" + p1.y + " : " + p2.x + "/" + p2.y + "/" + _segs.length);
		};
		var addSegment = function (p1, c1, p2, c2) {
			_segs.push(new MORPH.Segment(p1, c1, p2, c2));
			//trace("add seg :" + p1.x + "/" + p1.y + " : " + p2.x + "/" + p2.y + "/" + _segs.length);
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

						addPoint(halfWay.x, halfWay.y)
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

		this.getMarkers = function () {
			var points = this.PathParser.getMarkerPoints();
			var angles = this.PathParser.getMarkerAngles();

			var markers = [];
			for (var i = 0; i < points.length; i++) {
				markers.push([points[i], angles[i]]);
			}
			return markers;
		};
	},
	clonePaths: function (paths) {
		var newPaths = []
		for (var i = 0; i < paths.length; i++) {
			newPaths.push(paths[i]);
		}
		return newPaths;
	}
};

// Include a performance.now polyfill
(function () {

	if ('performance' in window === false) {
		window.performance = {};
	}

	// IE 8
	Date.now = (Date.now || function () {
		return new Date().getTime();
	});

	if ('now' in window.performance === false) {
		var offset = window.performance.timing && window.performance.timing.navigationStart ? window.performance.timing.navigationStart
			: Date.now();

		window.performance.now = function () {
			return Date.now() - offset;
		};
	}

})();

var MORPH = (function() {
	var _morphs = [];
	return {

		add : function(morph) {
			_morphs.push(morph);
		},

		//todo check performance on time
		update : function(time) {

			if (_morphs.length === 0)
				return false;

			var i = 0, numMorphs = _morphs.length;

			time = time !== undefined ? time : window.performance.now();

			while (i < numMorphs) {
				if (_morphs[i].update(time)) {
					i++;
				} else {
					_morphs.splice(i, 1);
					numMorphs--;
				}
			}
			return true;
		},
		draw : function(p) {
			var i = 0, numMorphs = _morphs.length;
			while (i < numMorphs) {
				var morph = _morphs[i++];
				morph.draw(p)
			}
		},
		clear : function(){
			_morphs = [];
		}
	}
})();

/**
 * Morphable object
 *
 * @param paths
 * @param obj
 * @returns {MORPH.Morph}
 * @constructor
 */
MORPH.Morph = function(paths, obj) {
	obj = obj || {};

	var _paths = paths;
	var _current = 0;
	var _morphablePathCollection = [];
	var _ratio = 0;
	var _startTime;
	var _duration = obj["duration"] || 1000;
	var _delayTime = 0;
	var _looping = obj["looping"] || false;
	var _numPaths = _looping ? _paths.length + 1 : _paths.length;
	var _completeCallback = obj["onComplete"];
	var _x = 0, _y = 0;

	function init() {
		reset();
	}
	function reset() {
		var i = 0;
		if (_numPaths > 1) {
			_morphablePathCollection = [];
			while (_morphablePathCollection.length < _numPaths - 1) {
				var Morphables = MORPH.createMorphablePath(_paths[i].getSegments(), _paths[(i + 1) % _paths.length].getSegments());
				_morphablePathCollection.push(Morphables);
				i++;
			}
		} else
			_morphablePathCollection.push(_paths[0]);
	}

	this.start = function(time) {
		_startTime = time !== undefined ? time : window.performance.now();
		_startTime += _delayTime;
		MORPH.add(this);

		return this;
	};
	this.update = function(time) {
		var isComplete, index = 0;

		_ratio = Math.max(0, Math.min(1, (time - _startTime) / _duration));

		if (_numPaths > 1) {
			index = Math.floor(_ratio * (_numPaths - 1));
			isComplete = index >= _numPaths - 1;
		} else {
			isComplete = _ratio >= 1;
		}

		if (isComplete) {

			if (_completeCallback != null)
				_completeCallback();

			if (_looping) {
				_startTime = time !== undefined ? time : window.performance.now();
				_current = 0;
				_ratio = 0;
				return true;
			}
			return false;
		} else
			_current = index;

		return true;
	};
	this.getCurrentPath = function() {
		return _paths[_paths.length - 1];
	};
	this.getCurrentRatio = function() {
		var cR = (_ratio * (_numPaths - 1)) - _current;
		return cR;
	};
	this.getCurrentMorphablePath = function() {
		if (_current < _morphablePathCollection.length)
			return _morphablePathCollection[_current];
		else {
			console.log("Error : something wrong here!");
		}
	};
	this.getShape = function() {
		if (_numPaths > 1)
			return this.currentShape();
		else {
			var path = _paths[0];
			return new MORPH.Shape(path.getSegments());
		}
	};
	this.currentShape = function() {
		var currentMorphablePathGroups = this.getCurrentMorphablePath().morphableGroups;

		var ratio = this.getCurrentRatio();
		var numGroups = currentMorphablePathGroups.length;
		var numSegs = currentMorphablePathGroups.length;
		var segs = [];

		for (var i = 0; i < numSegs; i++) {
			var morphableSegmentGroup = currentMorphablePathGroups[i];
			var morphedSegs = morphableSegmentGroup.interpolate(ratio);
			segs = segs.concat(morphedSegs);
		}

		return new MORPH.Shape(segs);
	};
	this.onComplete = function(callback) {
		_onCompleteCallback = callback;
		return this;
	};
	this.setScale = function(scale) {
		for (var i = 0; i < _paths.length; i++) {
			_paths[i].setScale(scale);
		}
		reset();

		return this;
	};
	this.getWidth = function() {
		var w = 0;
		for (var i = 0; i < _paths.length; i++) {
			if (_paths[i].width() > w)
				w = _paths[i].width();
		}
		return w;
	};
	this.getHeight = function() {
		var h = 0;
		for (var i = 0; i < _paths.length; i++) {
			if (_paths[i].height() > h)
				h = _paths[i].height();
		}
		return h;
	};
	this.setPos = function(x, y) {
		var diffX = x - _x;
		var diffY = y - _y;
		_x = x;
		_y = y;
		var i = 0;
		while (i < _paths.length) {
			var path = _paths[i];
			path.translate(x, y);
			i++;
		}

		return this;
	};
	init();
	return this;
};
MORPH.createMorphablePath = function(segGroup1, segGroup2) {
	var morphableGroups = [];
	var s1 = segGroup1.length;
	var s2 = segGroup2.length;
	var minCount = Math.min(s1, s2);

	var k1 = 0, k2 = 0;
	for (var k = 0; k < minCount; k++) {
		var arr1 = [], arr2 = [];
		if (s2 > s1) {
			k1 = k;
			arr1.push(segGroup1[k1]);

			while (k2 * (s1 / s2) < (k + 1) && k2 < s2) {
				arr2.push(segGroup2[k2]);
				k2++;
			}
		} else {
			k2 = k;
			arr2.push(segGroup2[k2]);
			while (k1 * (s2 / s1) < (k + 1) && k1 < s1) {
				arr1.push(segGroup1[k1]);
				k1++
			}

		}
		morphableGroups.push(new MORPH.MorphableGroup(arr1, arr2));
	}
	return new MORPH.MorphablePath(morphableGroups);
};
MORPH.MorphableGroup = function(origSegs, destSegs) {
	var _origSegs = origSegs || [];
	var _destSegs = destSegs || [];
	var _heteromorphic = origSegs.length != destSegs.length;
	var _maxLength = Math.max(_origSegs.length, _destSegs.length);
	var _segs, _startSegs, _endSegs;
	var _interSeg;

	function init() {
		if (!_heteromorphic) {
			_segs = [];
			if (_destSegs) {
				for (var i = 0; i < _maxLength; i++) {
					_segs.push(new MORPH.MorphSegment(_origSegs[i], _destSegs[i]));
				}
			} else
				_segs = _origSegs;

		} else {

			if(destSegs.length > 1){
				_interSeg = new MORPH.Segment(_origSegs[0].pt1.Interpolate(_destSegs[0].pt1, 0.5), null, _origSegs[_origSegs.length - 1].pt2.Interpolate(_destSegs[_destSegs.length - 1].pt2, 0.5), null);
			}else{
				_interSeg = _destSegs[0].clone();
			}

			_segs = _startSegs = defineStartInterSegs();
		}
	}
	function defineStartInterSegs() {
		var interSegs = [];
		var percentage, pt1, pt2;
		pt2 = _interSeg.pt1;
		//create array of morph points
		var i = 0;
		while (i < _origSegs.length) {
			percentage = (i + 1) / _origSegs.length;
			pt1 = pt2.clone();
			pt2 = _interSeg.pt1.Interpolate(_interSeg.pt2, percentage);
			var seg = new MORPH.Segment(pt1, null, pt2, null);
			interSegs.push(new MORPH.MorphSegment(_origSegs[i], seg));
			i++;
		}
		return interSegs
	}
	function defineEndInterSegs() {
		var interSegs = [];
		var percentage, pt1, pt2;
		pt2 = _interSeg.pt1;
		//create array of svgMorph points
		var i = 0;
		while (i < _destSegs.length) {
			percentage = (i + 1) / _destSegs.length;
			pt1 = pt2.clone();
			pt2 = _interSeg.pt1.Interpolate(_interSeg.pt2, percentage);
			var seg = new MORPH.Segment(pt1, null, pt2, null);
			interSegs.push(new MORPH.MorphSegment(seg, _destSegs[i]));
			i++;
		}
		return interSegs
	}
	function interpolateHetero(percentage) {
		if (percentage >= 0.5) {
			if (!_endSegs)
				_endSegs = defineEndInterSegs(_interSeg.pt1, _destSegs);

			_segs = _endSegs;
		} else
			_segs = _startSegs;

		return percentage < 0.5 ? percentage / 0.5 : (percentage - 0.5) / 0.5;
	}
	this.translate = function(x, y) {

		setSegmentPos(_origSegs, x, y);

		if (destSegs)
			setSegmentPos(_destSegs, x, y);

		function setSegmentPos(segArray, x, y) {
			var i = 0;
			for (var i = 0; i < segArray.length; i++) {
				segArray[i].translate(x, y);
			}
		}

		init();
	};
	this.interpolate = function(percentage) {
		var segs = [];

		if (_heteromorphic && _destSegs.length > 1)
			percentage = interpolateHetero(percentage);

		//todo interpolate points on curve for more realistic translation

		for (var i = 0; i < _segs.length; i++) {
			segs.push(_segs[i].interpolate(percentage));
		}
		return segs;
	};

	init();
};
MORPH.MorphablePath = function(morphableGroups) {
	return {
		morphableGroups : morphableGroups
	};
};
MORPH.Shape = function(segmentCollection) {
	var _segmentCollection = segmentCollection || [];
	return {
		segmentCollection : _segmentCollection,
		length : segmentCollection.length
	};
};
MORPH.Segment = function(p1, ctrl1, p2, ctrl2) {
	this.pt1 = p1 !== null ? p1.clone() : new MORPH.GEOM.Point();
	this.pt2 = p2 !== null ? p2.clone() : new MORPH.GEOM.Point();
	this.ctrl2 = ctrl2 || this.pt2.clone();
	this.ctrl1 = ctrl1 || this.pt1.clone();

	this.interpolate = function () {
	};

	this.draw = function (p) {
		p.bezier(this.pt1.x, this.pt1.y, this.ctrl1.x, this.ctrl1.y, this.ctrl2.x, this.ctrl2.y, this.pt2.x, this.pt2.y);
	};

	this.translate = function (x, y) {
		//trace("translate : " + x + " : " + y);
		this.pt1.translate(x, y);
		this.pt2.translate(x, y);
		this.ctrl1.translate(x, y);
		this.ctrl2.translate(x, y);
	};

	this.scale = function (scale, regPt) {

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

	};
	this.isCurve = function () {
		return !pt1.equals(ctrl1) && !pt2.equals(ctrl2);
	};
	this.clone = function () {
		return new MORPH.Segment(this.pt1.clone(), this.ctrl1.clone(), this.pt2.clone(), this.ctrl2.clone());
	};
};
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
