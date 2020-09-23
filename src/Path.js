import Segment from './Segment.js';
import BoundingBox from './BoundingBox.js';
import {PathUtils} from './utils/PathUtils.js';
import {GEOM} from './utils/GeomUtils.js';

export default class Path{

    /**
     *
     * @param name : string
     * @param id : string
     * @param d : string
     */
    constructor({name = "", id = "", d}) {

        this.name = name;
        this.id = id;

        this._segs = [];
        this._points = [];

        /** @type {GEOM.Rectangle} */
        this._rect;

        this._x = 0;
        this._y = 0;

        this._d = d;

        this._parse();
    }

    /**
     *
     * @param x : number
     * @param y : number
     * @private
     */
    _addPoint (x, y){
        var p = new GEOM.Point(x, y);
        if (!this._isFirstPoint()) {
            this._addLineSegment(this._getLastPoint(), p);
        }
        this._points.push(p);
    }

    /**
     *
     * @param ctrl1 : GEOM.Point
     * @param ctrl2 : GEOM.Point
     * @param pt2 : GEOM.Point
     * @private
     */
    _addCurvedPoint (ctrl1, ctrl2, pt2){
        var pt1 = this._getLastPoint();
        this._addSegment(pt1, ctrl1, pt2, ctrl2);
        this._points.push(pt2);
    }

    /**
     *
     * @param p1 : GEOM.Point
     * @param p2 : GEOM.Point
     * @private
     */
    _addLineSegment (p1, p2){
        this._segs.push(new Segment(p1, p1, p2, p2));
    }

    /**
     *
     * @param p1 : GEOM.Point
     * @param c1 : GEOM.Point
     * @param p2 : GEOM.Point
     * @param c2 : GEOM.Point
     * @private
     */
    _addSegment (p1, c1, p2, c2){
        this._segs.push(new Segment(p1, c1, p2, c2));
    }

    /**
     *
     * @return {GEOM.Point}
     * @private
     */
    _getLastPoint (){
        return this._points[this._points.length - 1].clone();
    }

    /**
     *
     * @return {boolean}
     * @private
     */
    _isFirstPoint (){
        return this._points.length == 0;
    }

    /**
     *
     * @private
     */
    _parse(){

        var _d = this._d;
        var bb = new BoundingBox();

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

        var pp = new PathUtils.PATH.PathParser(_d);
        pp.reset();

        while (!pp.isEnd()) {
            pp.nextCommand();
            switch (pp.command) {
                case 'M':
                case 'm':
                    var p = pp.getAsCurrentPoint();
                    pp.addMarker(p);
                    this._addPoint(p.x, p.y);
                    bb.addPoint(p.x, p.y);

                    pp.start = pp.current;
                    while (!pp.isCommandOrEnd()) {
                        var p = pp.getAsCurrentPoint();
                        pp.addMarker(p, pp.start);
                        this._addPoint(p.x, p.y);
                        bb.addPoint(p.x, p.y);
                    }
                    break;
                case 'L':
                case 'l':
                    while (!pp.isCommandOrEnd()) {
                        var c = pp.current;
                        var p = pp.getAsCurrentPoint();
                        pp.addMarker(p, c);
                        this._addPoint(p.x, p.y);
                        bb.addPoint(p.x, p.y);
                    }
                    break;
                case 'H':
                case 'h':
                    while (!pp.isCommandOrEnd()) {
                        var newP = new GEOM.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
                        pp.addMarker(newP, pp.current);
                        pp.current = newP;
                        this._addPoint(newP.x, newP.y);
                        bb.addPoint(pp.current.x, pp.current.y);
                    }
                    break;
                case 'V':
                case 'v':
                    while (!pp.isCommandOrEnd()) {
                        var newP = new GEOM.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
                        pp.addMarker(newP, pp.current);
                        pp.current = newP;
                        this._addPoint(newP.x, newP.y);
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
                        this._addCurvedPoint(new GEOM.Point(p1.x, p1.y), new GEOM.Point(cntrl.x, cntrl.y), new GEOM.Point(cp.x, cp.y));
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
                        this._addCurvedPoint(new GEOM.Point(p1.x, p1.y), new GEOM.Point(cntrl.x, cntrl.y), new GEOM.Point(cp.x, cp.y));
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
                        this._addCurvedPoint(new GEOM.Point(p1.x, p1.y), new GEOM.Point(cntrl.x, cntrl.y), new GEOM.Point(cp.x, cp.y));
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
                        this._addCurvedPoint(new GEOM.Point(p1.x, p1.y), new GEOM.Point(cntrl.x, cntrl.y), new GEOM.Point(cp.x, cp.y));
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
                        var currp = new GEOM.Point(Math.cos(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2.0, -Math.sin(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2.0);
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
                        var cpp = new GEOM.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx);
                        // cx, cy
                        var centp = new GEOM.Point((curr.x + cp.x) / 2.0 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y, (curr.y + cp.y) / 2.0 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y);
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
                        var halfWay = new GEOM.Point(centp.x + rx * Math.cos((a1 + (a1 + ad)) / 2), centp.y + ry * Math.sin((a1 + (a1 + ad)) / 2));
                        pp.addMarkerAngle(halfWay, (a1 + (a1 + ad)) / 2 + (sweepFlag == 0 ? -1 : 1) * Math.PI / 2);
                        pp.addMarkerAngle(cp, (a1 + ad) + (sweepFlag == 0 ? -1 : 1) * Math.PI / 2);

                        this._addPoint(halfWay.x, halfWay.y);
                        this._addPoint(cp.x, cp.y);

                        bb.addPoint(cp.x, cp.y);
                    }
                    break;
                case 'Z':
                case 'z':
                    pp.current = pp.start;
                    this._addPoint(pp.start.x, pp.start.y);
            }
        }
    }

    clone() {
        var p = new Path({d: this._d});
        p.setRectangle(this._rect.clone());
        p.name = this.name;
        return p;
    }

    translate(x, y) {
        this._x = x;
        this._y = y;
        for (var i = 0; i < this._segs.length; i++) {
            var seg = this._segs[i];
            seg.translate(x, y);
        }
        this._rect.translate(x, y);
    }

    setScale(scaleX, scaleY) {
        scaleY = scaleY || scaleX;
        for (var i = 0; i < this._segs.length; i++) {
            var seg = this._segs[i];
            seg.scale(scaleX, scaleY, new GEOM.Point(0, 0));
        }
        this._rect.scale(scaleX, scaleY);
    }

    setRectangle(rect) {
        this._rect = rect;
    }

    width() {
        return this._rect.width();
    }

    height() {
        return this._rect.height();
    }

    /*setSegments(segs) {
        var segments = [];
        for (var i = 0; i < segs.length; i++) {
            segments = segs[i].clone();
        }
    }*/

    getSegments() {
        //trace("return :" + _segs.length);
        var segments = [];
        for (var i = 0; i < this._segs.length; i++) {
            segments.push(this._segs[i].clone());
        }
        return segments;
    }

    getPosition(){
        return new GEOM.Point(this._x, this._y);
    }
}