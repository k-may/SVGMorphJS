var svgMorph = {};
svgMorph.Point = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;

	this.draw = function(p) {
		p.ellipse(this.x, this.y, 10, 10);
	}

	this.clone = function() {
		return new svgMorph.Point(this.x, this.y);
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
		for (var i = 0; i < data.length; i++) {
			var pathData = svgMorph.getPathStrings(data[i]);
			console.dir(pathData);
			for (var p = 0; p < pathData.length; p++) {
				var path = new Path(pathData[p]);
				svgPaths.push(path);
			}
		}
		callback(svgPaths);
	}


	Poller.loadData(paths, loaded);
}
svgMorph.getPathStrings = function(xml) {
	//			console.dir(xml.childNodes[2].childNodes[1].attributes[3].nodeValue);
	//return xml.childNodes[2].childNodes[1].attributes[3].nodeValue;
	var arr = new Array();
	$(xml).find('path').each(function(data) {
		var d = $(this).attr('d');
		//trace("d : " + d);
		arr.push(d);
	});
	return arr;
}
svgMorph.Segment = function(pt1, ctrl1, pt2, ctrl2, color) {
	var _pt1, _pt2, _ctrl1, _ctrl2;
	this.pt1 = pt1 !== null ? pt1.clone() : new svgMorph.Point();
	this.ctrl1 = ctrl1 || this.pt1.clone();
	this.pt2 = pt2 !== null ? pt1.clone() : new svgMorph.Point();
	this.ctrl2 = ctrl2 || this.pt2.clone();

	this.color = color || 0;

	//trace("Segment : p1 :" + this.pt1.trace() + " ctrl1 :" + this.ctrl1.trace() + " ctrl2 " + this.ctrl2.trace() + " p2 :" + this.pt2.trace());
	this.draw = function(p) {
		p.bezier(this.pt1.x, this.pt1.y, this.ctrl1.x, this.ctrl1.y, this.ctrl2.x, this.ctrl2.y, this.pt2.x, this.pt2.y);
	}

	this.scale = function(scale, regPt) {

		var regPt = regPt || new svgMorph.Point(0, 0);
		//TODO : scale by registration point
		
		var ctrlV1 = new svgMorph.Vector((ctrl1.x - this.pt1.x) * scale, (ctrl1.y - this.pt1.y) * scale);
		var ctrlV2 = new svgMorph.Point((ctrl2.x - this.pt2.x) * scale, (ctrl2.y - this.pt2.y) * scale);
		
		this.pt1.x *= scale;
		this.pt1.y *= scale;
		this.pt2.x *= scale;
		this.pt2.y *= scale;

		this.ctrl1 = new svgMorph.Point(this.pt1.x + ctrlV1.x, this.pt1.y + ctrlV1.y);
		this.ctrl2 = new svgMorph.Point(this.pt2.x + ctrlV2.x, this.pt2.y + ctrlV2.y);

	}
	
	this.isCurve = function(){
		return !pt1.equals(ctrl1) && !pt2.equals(ctrl2);
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
var PathParser = function(d) {
	//console.log("d ===! : " + d);
	var d = d || "";
	this.tokens = d.split(' ');
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
var Path = function(d) {
	var i;

	var _segs = [];
	var _points = [];
	var _currentSegment;

	this.setScale = function(scale) {
		for (var i = 0; i < _segs.length; i++) {
			var seg = _segs[i];
			seg.scale(scale, new Point(0, 0));
		}
	}
	this.getSegments = function() {
		return _segs;
	}
	var getLastPoint = function() {
		return _points[_points.length - 1];
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
		//trace("add seg :" + p1.x + "/" + p1.y + " : " + p2.x + "/" + p2.y + "/" + _segs.length);
	}
	var addSegment = function(p1, c1, p2, c2) {
		_segs.push(new svgMorph.Segment(p1, c1, p2, c2));
		//trace("add seg :" + p1.x + "/" + p1.y + " : " + p2.x + "/" + p2.y + "/" + _segs.length);
	}
	d = d.replace(/,/gm, ' ');
	// get rid of all commas
	d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2');
	// separate commands from commands
	d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2');
	// separate commands from commands
	d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm, '$1 $2');
	// separate commands from points
	d = d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2');
	// separate commands from points
	d = d.replace(/([0-9])([+\-])/gm, '$1 $2');
	// separate digits when no comma
	d = d.replace(/(\.[0-9]*)(\.)/gm, '$1 $2');
	// separate digits when no comma
	d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm, '$1 $3 $4 ');
	// shorthand elliptical arc path syntax
	//d = svg.compressSpaces(d);
	d = d.replace(/[\s\r\t\n]+/gm, ' ');
	// compress multiple spaces
	d = d.replace(/^\s+|\s+$/g, '');
	;
	//trace("\n\nd =-->");
	//console.log(d);
	//var bb = new svg.BoundingBox();
	var pp = new PathParser(d);
	pp.reset();

	while (!pp.isEnd()) {
		pp.nextCommand();
		switch (pp.command) {
			case 'M':
			case 'm':
				var p = pp.getAsCurrentPoint();
				pp.addMarker(p);
				addPoint(p.x, p.y);
				//bb.addPoint(p.x, p.y);
				/*if (ctx != null)
				 ctx.moveTo(p.x, p.y);
				 */
				pp.start = pp.current;
				while (!pp.isCommandOrEnd()) {
					var p = pp.getAsCurrentPoint();
					pp.addMarker(p, pp.start);
					addPoint(p.x, p.y);
					//bb.addPoint(p.x, p.y);
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
					//bb.addPoint(p.x, p.y);
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
					//bb.addPoint(pp.current.x, pp.current.y);
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
					//bb.addPoint(pp.current.x, pp.current.y);
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
					//bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
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

					//bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
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
					//bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
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
					//bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
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

					//bb.addPoint(cp.x, cp.y);
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

