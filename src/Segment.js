export default class Segment {

    /**
     *
     * @param pt1 : GEOM.Point
     * @param ctrl1 : GEOM.Point
     * @param pt2 : GEOM.Point
     * @param ctrl2 : GEOM.Point
     */
    constructor(pt1, ctrl1, pt2, ctrl2) {
        this.pt1 = pt1 !== null ? {x: pt1.x, y: pt1.y} : {x: 0, y: 0};
        this.pt2 = pt2 !== null ? {x: pt2.x, y: pt2.y} : {x: 0, y: 0};

        this.ctrl2 = ctrl2 || {x: pt2.x, y: pt2.y};
        this.ctrl1 = ctrl1 || {x: pt1.x, y: pt1.y};
    }

    interpolate() {
    }

    /**
     * Legacy (Processing.js)
     * @param p
     */
    draw(p) {
        p.bezier(this.pt1.x, this.pt1.y, this.ctrl1.x, this.ctrl1.y, this.ctrl2.x, this.ctrl2.y, this.pt2.x, this.pt2.y);
    }

    /**
     *
     * @param x : number
     * @param y : number
     */
    translate(x, y) {
        //trace("translate : " + x + " : " + y);
        this.pt1.x += x;
        this.pt1.y += y;

        this.pt2.x += x;
        this.pt2.y += y;

        this.ctrl1.x += x;
        this.ctrl1.y += y;

        this.ctrl2.x += x;
        this.ctrl2.y += y;
    }

    /**
     *
     * @param scaleX : number
     * @param scaleY : number
     * @param regPt : ?GEOM.Point
     */
    scale(scaleX, scaleY, regPt) {

        //var regPt = regPt || new GEOM.Point(0, 0);
        //TODO : scale by registration point
        var ctrlV1 = {
            x: (this.ctrl1.x - this.pt1.x) * scaleX,
            y: (this.ctrl1.y - this.pt1.y) * scaleY
        };
        var ctrlV2 = {
            x: (this.ctrl2.x - this.pt2.x) * scaleX,
            y: (this.ctrl2.y - this.pt2.y) * scaleY
        };

        this.pt1.x *= scaleX;
        this.pt1.y *= scaleY;
        this.pt2.x *= scaleX;
        this.pt2.y *= scaleY;

        this.ctrl1.x = this.pt1.x + ctrlV1.x;
        this.ctrl1.y = this.pt1.y + ctrlV1.y;

        this.ctrl2.x = this.pt2.x + ctrlV2.x;
        this.ctrl2.y = this.pt2.y + ctrlV2.y;
    }

    /*isCurve() {
        return !pt1.equals(ctrl1) && !pt2.equals(ctrl2);
    }*/

    /**
     *
     * @return {Segment}
     */
    clone() {
        return new Segment(
            {x: this.pt1.x, y: this.pt1.y},
            {x: this.ctrl1.x, y: this.ctrl1.y},
            {x: this.pt2.x, y: this.pt2.y},
            {x: this.ctrl2.x, y: this.ctrl2.y});
    }
}