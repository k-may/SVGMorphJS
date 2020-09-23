export default class BoundingBox{

    /**
     *
     * @param x1 : number
     * @param y1 : number
     * @param x2 : number
     * @param y2 : number
     */
    constructor(x1, y1, x2, y2) {
        this.x1 = Number.NaN;
        this.y1 = Number.NaN;
        this.x2 = Number.NaN;
        this.y2 = Number.NaN;

        this.addPoint(x1, y1);
        this.addPoint(x2, y2);
    }

    /**
     *
     * @param scale : number
     */
    scale(scale) {
        this.x2 = this.x1 + this.width() * scale;
        this.y2 = this.y1 + this.height() * scale;
    }

    /**
     *
     * @return {number}
     */
    getX() {
        return this.x1;
    }

    /**
     *
     * @return {number}
     */
    getY() {
        return this.y1;
    }

    /**
     *
     * @return {number}
     */
    getWidth() {
        return this.x2 - this.x1;
    }

    /**
     *
     * @return {number}
     */
    getHeight() {
        return this.y2 - this.y1;
    }

    /**
     *
     * @param x : number
     * @param y : number
     */
    addPoint(x, y) {
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

    /**
     *
     * @param x
     */
    addX(x) {
        this.addPoint(x, null);
    }

    /**
     *
     * @param y
     */
    addY(y) {
        this.addPoint(null, y);
    }

    /**
     *
     * @param bb : BoundingBox
     */
    addBoundingBox(bb) {
        this.addPoint(bb.x1, bb.y1);
        this.addPoint(bb.x2, bb.y2);
    }

    /**
     *
     * @param p0x : number
     * @param p0y : number
     * @param p1x : number
     * @param p1y : number
     * @param p2x : number
     * @param p2y : number
     */
    addQuadraticCurve(p0x, p0y, p1x, p1y, p2x, p2y) {
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

    /**
     *
     * @param p0x : number
     * @param p0y : number
     * @param p1x : number
     * @param p1y : number
     * @param p2x : number
     * @param p2y : number
     * @param p3x : number
     * @param p3y : number
     */
    addBezierCurve(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
        // from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
        var p0 = [p0x, p0y], p1 = [p1x, p1y], p2 = [p2x, p2y], p3 = [p3x, p3y];
        this.addPoint(p0[0], p0[1]);
        this.addPoint(p3[0], p3[1]);

        for (var i = 0; i <= 1; i++) {
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
    }

    /**
     *
     * @param x : number
     * @param y : number
     * @return {boolean|boolean}
     */
    isPointInBox(x, y) {
        return (this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2);
    }
}