var svgMorph = {};
svgMorph.Rectangle = function(x, y, width, height) {
	this.x1 = x;
	this.y1 = y;
	this.w = width;
	this.h = height;

	this.width = function() {
		return this.w;
	}

	this.height = function() {
		return this.h;
	}

	this.scale = function(scale) {
		this.w = this.w * scale;
		this.h = this.h * scale;
	}

	this.translate = function(x, y) {
		this.x1 += x;
		this.y1 += y;
	}

	this.clone = function() {
		return new svgMorph.Rectangle(this.x1, this.y1, this.w, this.h);
	}
}

svgMorph.Point = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;

	this.draw = function(p) {
		p.ellipse(this.x, this.y, 10, 10);
	}

	this.clone = function() {
		var x = this.x;
		var y = this.y;
		return new svgMorph.Point(x, y);
	}

	this.equals = function(pt) {
		return (this.x == pt.x && this.y == pt.y);
	}

	this.trace = function() {
		return "{" + this.x + "," + this.y + "}";
	}
	this.applyTransform = function(v) {
		var xp = this.x * v[0] + this.y * v[2] + v[4];
		var yp = this.x * v[1] + this.y * v[3] + v[5];
		this.x = xp;
		this.y = yp;
	}
	this.angleTo = function(p) {
		return Math.atan2(p.y - this.y, p.x - this.x);
	}

	this.Interpolate = function(pt2, percentage) {
		var newX = this.x + (pt2.x - this.x) * percentage;
		var newY = this.y + (pt2.y - this.y) * percentage;
		return new svgMorph.Point(newX, newY);
	}
	this.translate = function(tX, tY) {
		var pX = this.x + tX;
		var pY = this.y + tY;
		this.x = pX;
		this.y = pY;
	}
}
svgMorph.RandomPoint = function(width, height) {
	var newX = Math.random() * width;
	var newY = Math.random() * height;
	return new svgMorph.Point(newX, newY);
}
svgMorph.Vector = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;

	this.Interpolate = function(percentage) {
		return new svgMorph.Vector(this.x * percentage, this.y * percentage);
	}
}
svgMorph.LoadSVG = function(paths, callback) {
	var svgPaths = [];
	function loaded(data) {
		var bb = svgMorph.getBoundingBox(data);
		for (var i = 0; i < data.length; i++) {
			var pathData = svgMorph.getPathStrings(data[i]);
			//trace("--> path strings : " + i + " : length " + pathData.length);
			//console.dir(pathData);
			for (var p = 0; p < pathData.length; p++) {
				var path = new Path(pathData[p]);
				path.setRectangle(bb.clone());
				//trace("push path : --> " + path);
				svgPaths.push(path);
			}
		}
		callback(svgPaths);
	}


	Poller.loadData(paths, loaded);
}
svgMorph.getBoundingBox = function(xml) {
	var attributes = $(xml).find('svg')[0].attributes;
	var x = svgMorph.getNodeValue(attributes, "x");
	var y = svgMorph.getNodeValue(attributes, "y");
	var width = svgMorph.getNodeValue(attributes, "width");
	var height = svgMorph.getNodeValue(attributes, "height");
	//trace("PAth BB : x:" + x + " y:" + y + " width:" + width + " height:" + height);

	return new svgMorph.Rectangle(x, y, width, height);
}

svgMorph.getNodeValue = function(attributes, name) {
	return parseInt(attributes[name].nodeValue);
}
svgMorph.getPathStrings = function(xml) {

	var arr = new Array();
	var paths = $(xml).find('path');

	if (paths.length == 0) {
		trace("SVGMorphError : no paths found in svg!");
		return [];
	}

	$(paths).each(function(data) {
		var name = $(this).attr('name') || this.baseURI || "";
		var d = $(this).attr('d');
		//trace("d : " + d);

		arr.push({
			name : name,
			d : d
		});
	});

	return arr;
}

svgMorph.Segment = function(p1, ctrl1, p2, ctrl2, color) {
	this.pt1 = p1 !== null ? p1.clone() : new svgMorph.Point();
	this.pt2 = p2 !== null ? p2.clone() : new svgMorph.Point();
	this.ctrl2 = ctrl2 || this.pt2.clone();
	this.ctrl1 = ctrl1 || this.pt1.clone();

	this.color = color || 0;

	this.interpolate = function() {
	}
	
	this.draw = function(p) {
		p.bezier(this.pt1.x, this.pt1.y, this.ctrl1.x, this.ctrl1.y, this.ctrl2.x, this.ctrl2.y, this.pt2.x, this.pt2.y);
	}

	this.translate = function(x, y) {
		//trace("translate : " + x + " : " + y);
		this.pt1.translate(x, y);
		this.pt2.translate(x, y);
		this.ctrl1.translate(x, y);
		this.ctrl2.translate(x, y);
	}

	this.scale = function(scale, regPt) {

		var regPt = regPt || new svgMorph.Point(0, 0);
		//TODO : scale by registration point

		var ctrlV1 = new svgMorph.Vector((this.ctrl1.x - this.pt1.x) * scale, (this.ctrl1.y - this.pt1.y) * scale);
		var ctrlV2 = new svgMorph.Point((this.ctrl2.x - this.pt2.x) * scale, (this.ctrl2.y - this.pt2.y) * scale);

		this.pt1.x *= scale;
		this.pt1.y *= scale;
		this.pt2.x *= scale;
		this.pt2.y *= scale;

		this.ctrl1 = new svgMorph.Point(this.pt1.x + ctrlV1.x, this.pt1.y + ctrlV1.y);
		this.ctrl2 = new svgMorph.Point(this.pt2.x + ctrlV2.x, this.pt2.y + ctrlV2.y);

	}

	this.isCurve = function() {
		return !pt1.equals(ctrl1) && !pt2.equals(ctrl2);
	}

	this.clone = function() {
		return new svgMorph.Segment(this.pt1.clone(), this.ctrl1.clone(), this.pt2.clone(), this.ctrl2.clone());
	}
}
svgMorph.MorphSegment = function(origSeg, destSeg) {
	this.origSeg = origSeg;
	this.destSeg = destSeg;
	this.ctrlV1 = new svgMorph.Vector(this.destSeg.ctrl1.x - this.origSeg.ctrl1.x, this.destSeg.ctrl1.y - this.origSeg.ctrl1.y);
	this.ctrlV2 = new svgMorph.Vector(this.destSeg.ctrl2.x - this.origSeg.ctrl2.x, this.destSeg.ctrl2.y - this.origSeg.ctrl2.y);

	this.interpolate = function(percentage) {
		var pt1 = this.origSeg.pt1.Interpolate(this.destSeg.pt1, percentage);
		var pt2 = this.origSeg.pt2.Interpolate(this.destSeg.pt2, percentage);
		var cV = this.ctrlV1.Interpolate(percentage);
		var ctrl1 = new svgMorph.Point(cV.x + this.origSeg.ctrl1.x, cV.y + this.origSeg.ctrl1.y);
		cV = this.ctrlV2.Interpolate(percentage);
		var ctrl2 = new svgMorph.Point(cV.x + this.origSeg.ctrl2.x, cV.y + this.origSeg.ctrl2.y);
		var seg = new svgMorph.Segment(pt1, ctrl1, pt2, ctrl2);
		//dir(seg);
		return seg;
	}
}
var BoundingBox = function(x1, y1, x2, y2) {// pass in initial points if you want
	this.x1 = Number.NaN;
	this.y1 = Number.NaN;
	this.x2 = Number.NaN;
	this.y2 = Number.NaN;

	this.scale = function(scale) {
		this.x2 = this.x1 + this.width() * scale;
		this.y2 = this.y1 + this.height() * scale;
	}

	this.x = function() {
		return this.x1;
	}
	this.y = function() {
		return this.y1;
	}
	this.width = function() {
		return this.x2 - this.x1;
	}
	this.height = function() {
		return this.y2 - this.y1;
	}

	this.addPoint = function(x, y) {
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
	}
	this.addX = function(x) {
		this.addPoint(x, null);
	}
	this.addY = function(y) {
		this.addPoint(null, y);
	}

	this.addBoundingBox = function(bb) {
		this.addPoint(bb.x1, bb.y1);
		this.addPoint(bb.x2, bb.y2);
	}

	this.addQuadraticCurve = function(p0x, p0y, p1x, p1y, p2x, p2y) {
		var cp1x = p0x + 2 / 3 * (p1x - p0x);
		// CP1 = QP0 + 2/3 *(QP1-QP0)
		var cp1y = p0y + 2 / 3 * (p1y - p0y);
		// CP1 = QP0 + 2/3 *(QP1-QP0)
		var cp2x = cp1x + 1 / 3 * (p2x - p0x);
		// CP2 = CP1 + 1/3 *(QP2-QP0)
		var cp2y = cp1y + 1 / 3 * (p2y - p0y);
		// CP2 = CP1 + 1/3 *(QP2-QP0)
		this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y, cp2y, p2x, p2y);
	}

	this.addBezierCurve = function(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
		// from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
		var p0 = [p0x, p0y], p1 = [p1x, p1y], p2 = [p2x, p2y], p3 = [p3x, p3y];
		this.addPoint(p0[0], p0[1]);
		this.addPoint(p3[0], p3[1]);

		for ( i = 0; i <= 1; i++) {
			var f = function(t) {
				return Math.pow(1 - t, 3) * p0[i] + 3 * Math.pow(1 - t, 2) * t * p1[i] + 3 * (1 - t) * Math.pow(t, 2) * p2[i] + Math.pow(t, 3) * p3[i];
			}
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
	}

	this.isPointInBox = function(x, y) {
		return (this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2);
	}

	this.addPoint(x1, y1);
	this.addPoint(x2, y2);
}
var PathParser = function(d) {
	//console.log("d ===! : " + d);
	var _d = d || "";
	this.tokens = _d.split(' ');
	//console.dir(this.tokens);

	this.reset = function() {
		this.i = -1;
		this.command = '';
		this.previousCommand = '';
		this.start = new svgMorph.Point(0, 0);
		this.control = new svgMorph.Point(0, 0);
		this.current = new svgMorph.Point(0, 0);
		this.points = [];
		this.angles = [];
	}

	this.isEnd = function() {
		return this.i >= this.tokens.length - 1;
	}

	this.isCommandOrEnd = function() {
		if (this.isEnd())
			return true;
		return this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null;
	}

	this.isRelativeCommand = function() {
		switch(this.command) {
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
	}

	this.getToken = function() {
		this.i++;
		return this.tokens[this.i];
	}

	this.getScalar = function() {
		return parseFloat(this.getToken());
	}

	this.nextCommand = function() {
		this.previousCommand = this.command;
		this.command = this.getToken();
	}

	this.getPoint = function() {
		var p = new svgMorph.Point(this.getScalar(), this.getScalar());
		return this.makeAbsolute(p);
	}

	this.getAsControlPoint = function() {
		var p = this.getPoint();
		this.control = p;
		return p;
	}

	this.getAsCurrentPoint = function() {
		var p = this.getPoint();
		this.current = p;
		return p;
	}

	this.getReflectedControlPoint = function() {
		if (this.previousCommand.toLowerCase() != 'c' && this.previousCommand.toLowerCase() != 's') {
			return this.current;
		}

		// reflect point
		var p = new svgMorph.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);
		return p;
	}

	this.makeAbsolute = function(p) {
		if (this.isRelativeCommand()) {
			p.x += this.current.x;
			p.y += this.current.y;
		}
		return p;
	}

	this.addMarker = function(p, from, priorTo) {
		// if the last angle isn't filled in because we didn't have this point yet ...
		if (priorTo != null && this.angles.length > 0 && this.angles[this.angles.length - 1] == null) {
			this.angles[this.angles.length - 1] = this.points[this.points.length - 1].angleTo(priorTo);
		}
		this.addMarkerAngle(p, from == null ? null : from.angleTo(p));
	}

	this.addMarkerAngle = function(p, a) {
		this.points.push(p);
		this.angles.push(a);
	}

	this.getMarkerPoints = function() {
		return this.points;
	}
	this.getMarkerAngles = function() {
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
}
var Path = function(obj) {
	var i;
	//trace("new path!: " + d);
	this.name = obj.name || "";

	var _d = obj.d;
	var _segs = [];
	var _points = [];
	var _rect;
	var _currentSegment;
	var bb = new BoundingBox();

	this.clone = function() {
		var p = new Path({d:_d});
		p.setRectangle(_rect.clone());
		p.name = this.name;
		return p;
	}

	this.translate = function(x, y) {
		for (var i = 0; i < _segs.length; i++) {
			var seg = _segs[i];
			seg.translate(x, y);
		}
		_rect.translate(x, y);
	}
	this.setScale = function(scale) {
		//trace("set scale : " + scale);
		for (var i = 0; i < _segs.length; i++) {
			var seg = _segs[i];
			seg.scale(scale, new Point(0, 0));
		}
		_rect.scale(scale);
	}
	this.setRectangle = function(rect) {
		_rect = rect;
	}

	this.width = function() {
		return _rect.width();
	}

	this.height = function() {
		return _rect.height();
	}

	this.setSegments = function(segs) {
		segments = [];
		for (var i = 0; i < segs.length; i++) {
			segments = segs[i].clone();
		}
	}

	this.getSegments = function() {
		//trace("return :" + _segs.length);
		var segments = [];
		for (var i = 0; i < _segs.length; i++) {
			segments.push(_segs[i].clone());
		}
		return segments;
	}
	var getLastPoint = function() {
		return _points[_points.length - 1].clone();
	}
	var isFirstPoint = function() {
		return _points.length == 0;
	}
	var getCurrentSegment = function() {
		return _currentSegment;
	}
	var isEndOfLine = function() {
		return !isFirstPoint();
	}
	var isDuplicate = function(pt) {
		if (isFirstPoint())
			return false;

		if (getLastPoint().equals(pt))
			return true;

		return false;
	}
	var addPoint = function(x, y) {
		var p = new svgMorph.Point(x, y);
		if (!isFirstPoint())
			addLineSegment(getLastPoint(), p);

		_points.push(p);
		//trace("add point -->" + x + " : " + y + "/" + _points.length);
	}
	var addCurvePoint = function(ctrl1, ctrl2, pt2) {
		var pt1 = getLastPoint();
		addSegment(pt1, ctrl1, pt2, ctrl2);
		_points.push(pt2);
		//trace("add point -->" + pt2.x + " : " + pt2.y + "/" + _points.length);

	}
	var addLineSegment = function(p1, p2) {
		_segs.push(new svgMorph.Segment(p1, p1, p2, p2));
		//trace("add line :" + p1.x + "/" + p1.y + " : " + p2.x + "/" + p2.y + "/" + _segs.length);
	}
	var addSegment = function(p1, c1, p2, c2) {
		_segs.push(new svgMorph.Segment(p1, c1, p2, c2));
		//trace("add seg :" + p1.x + "/" + p1.y + " : " + p2.x + "/" + p2.y + "/" + _segs.length);
	}
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

	var pp = new PathParser(_d);
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
				/*if (ctx != null)
				 ctx.moveTo(p.x, p.y);
				 */
				pp.start = pp.current;
				while (!pp.isCommandOrEnd()) {
					var p = pp.getAsCurrentPoint();
					pp.addMarker(p, pp.start);
					addPoint(p.x, p.y);
					bb.addPoint(p.x, p.y);
					/*if (ctx != null)
					 ctx.lineTo(p.x, p.y);
					 */
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
					/*if (ctx != null)
					 ctx.lineTo(p.x, p.y);*/
				}
				break;
			case 'H':
			case 'h':
				while (!pp.isCommandOrEnd()) {
					var newP = new svgMorph.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
					pp.addMarker(newP, pp.current);
					pp.current = newP;

					addPoint(newP.x, newP.y);
					bb.addPoint(pp.current.x, pp.current.y);
					/*if (ctx != null)
					 ctx.lineTo(pp.current.x, pp.current.y);*/
				}
				break;
			case 'V':
			case 'v':
				while (!pp.isCommandOrEnd()) {
					var newP = new svgMorph.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
					pp.addMarker(newP, pp.current);
					pp.current = newP;
					addPoint(newP.x, newP.y);
					bb.addPoint(pp.current.x, pp.current.y);
					/*if (ctx != null)
					 ctx.lineTo(pp.current.x, pp.current.y);*/
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

					addCurvePoint(new svgMorph.Point(p1.x, p1.y), new svgMorph.Point(cntrl.x, cntrl.y), new svgMorph.Point(cp.x, cp.y));
					bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
					/*if (ctx != null)
					 ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
					 */
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

					addCurvePoint(new svgMorph.Point(p1.x, p1.y), new svgMorph.Point(cntrl.x, cntrl.y), new svgMorph.Point(cp.x, cp.y));

					bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
					/*if (ctx != null)
					 ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
					 */
				}
				break;
			case 'Q':
			case 'q':
				while (!pp.isCommandOrEnd()) {
					var curr = pp.current;
					var cntrl = pp.getAsControlPoint();
					var cp = pp.getAsCurrentPoint();
					pp.addMarker(cp, cntrl, cntrl);

					addCurvePoint(new svgMorph.Point(p1.x, p1.y), new svgMorph.Point(cntrl.x, cntrl.y), new svgMorph.Point(cp.x, cp.y));
					bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
					/*if (ctx != null)
					 ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
					 */
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

					addCurvePoint(new svgMorph.Point(p1.x, p1.y), new svgMorph.Point(cntrl.x, cntrl.y), new svgMorph.Point(cp.x, cp.y));
					bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
					/*if (ctx != null)
					 ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
					 */
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

					// Conversion from endpoint to center parameterization
					// http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
					// x1', y1'
					var currp = new svgMorph.Point(Math.cos(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2.0, -Math.sin(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2.0);
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
					var cpp = new svgMorph.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx);
					// cx, cy
					var centp = new svgMorph.Point((curr.x + cp.x) / 2.0 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y, (curr.y + cp.y) / 2.0 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y);
					// vector magnitude
					var m = function(v) {
						return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
					}
					// ratio between two vectors
					var r = function(u, v) {
						return (u[0] * v[0] + u[1] * v[1]) / (m(u) * m(v))
					}
					// angle between two vectors
					var a = function(u, v) {
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
					var halfWay = new svgMorph.Point(centp.x + rx * Math.cos((a1 + (a1 + ad)) / 2), centp.y + ry * Math.sin((a1 + (a1 + ad)) / 2));
					pp.addMarkerAngle(halfWay, (a1 + (a1 + ad)) / 2 + (sweepFlag == 0 ? -1 : 1) * Math.PI / 2);
					pp.addMarkerAngle(cp, (a1 + ad) + (sweepFlag == 0 ? -1 : 1) * Math.PI / 2);

					addPoint(halfWay.x, halfWay.y)
					addPoint(cp.x, cp.y);

					bb.addPoint(cp.x, cp.y);
					// TODO: this is too naive, make it better
					if (ctx != null) {
						var r = rx > ry ? rx : ry;
						var sx = rx > ry ? 1 : rx / ry;
						var sy = rx > ry ? ry / rx : 1;

						ctx.translate(centp.x, centp.y);
						ctx.rotate(xAxisRotation);
						ctx.scale(sx, sy);
						ctx.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag);
						ctx.scale(1 / sx, 1 / sy);
						ctx.rotate(-xAxisRotation);
						ctx.translate(-centp.x, -centp.y);
					}
				}
				break;
			case 'Z':
			case 'z':
				/*if (ctx != null)
				 ctx.closePath();*/
				pp.current = pp.start;

				addPoint(pp.start.x, pp.start.y);
		}
	}

	//return bb;
	//}

	this.getMarkers = function() {
		var points = this.PathParser.getMarkerPoints();
		var angles = this.PathParser.getMarkerAngles();

		var markers = [];
		for (var i = 0; i < points.length; i++) {
			markers.push([points[i], angles[i]]);
		}
		return markers;
	}
};
svgMorph.clonePaths = function(paths) {
	var newPaths = []
	for (var i = 0; i < paths.length; i++) {
		newPaths.push(paths[i]);
	}
	return newPaths;
}
