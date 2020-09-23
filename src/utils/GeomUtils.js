export const GEOM = {

    /**
     *
     * @param pt1 : GEOM.Point
     * @param pt2 : GEOM.Point
     * @param percentage : number
     * @returns {GEOM.Point}
     * @constructor
     */
    InterpolatePt: function (pt1, pt2, percentage) {
        var newX = pt1.x + (pt2.x - pt1.x) * percentage;
        var newY = pt1.y + (pt2.y - pt1.y) * percentage;
        return new GEOM.Point(newX, newY);
    },

    /**
     *
     * @param x : number
     * @param y : number
     * @param width : number
     * @param height : number
     * @constructor
     */
    Rectangle: function (x, y, width, height) {
        this.x1 = x;
        this.y1 = y;
        this.w = width;
        this.h = height;

        /**
         *
         * @returns {number}
         */
        this.width = function () {
            return this.w;
        };

        /**
         *
         * @returns {number}
         */
        this.height = function () {
            return this.h;
        };

        /**
         *
         * @param scaleX : number
         * @param scaleY : number
         */
        this.scale = function (scaleX, scaleY) {
            this.w = this.w * scaleX;
            this.h = this.h * scaleY;
        };

        /**
         *
         * @param x : number
         * @param y : number
         */
        this.translate = function (x, y) {
            this.x1 += x;
            this.y1 += y;
        };

        /**
         *
         * @returns {GEOM.Rectangle}
         */
        this.clone = function () {
            return new GEOM.Rectangle(this.x1, this.y1, this.w, this.h);
        };
    },

    /**
     *
     * @param x : number
     * @param y : number
     * @constructor
     */
    Point: function (x, y) {
        this.x = x || 0;
        this.y = y || 0;

        /**
         * Legacy
         * @param p : Processing Context
         */
        this.draw = function (p) {
            p.ellipse(this.x, this.y, 10, 10);
        };

        /**
         *
         * @returns {GEOM.Point}
         */
        this.clone = function () {
            return new GEOM.Point(this.x, this.y);
        };

        /**
         *
         * @param pt : GEOM.Point
         * @returns {boolean|boolean}
         */
        this.equals = function (pt) {
            return (this.x == pt.x && this.y == pt.y);
        };

        this.trace = function () {
            return '{' + this.x + ',' + this.y + '}';
        };

        /**
         *
         * @param v : GEOM.Vector
         */
        this.applyTransform = function (v) {
            var xp = this.x * v[0] + this.y * v[2] + v[4];
            var yp = this.x * v[1] + this.y * v[3] + v[5];
            this.x = xp;
            this.y = yp;
        };

        /**
         *
         * @param p : number
         * @returns {number}
         */
        this.angleTo = function (p) {
            return Math.atan2(p.y - this.y, p.x - this.x);
        };

        /**
         *
         * @param pt1 : GEOM.Point
         * @param pt2 : GEOM.Point
         * @param percentage : number
         * @returns {GEOM.Point}
         * @constructor
         */
        this.Interpolate = function (pt1, pt2, percentage) {
            var newX = pt1.x + (pt2.x - pt1.x) * percentage;
            var newY = pt1.y + (pt2.y - pt1.y) * percentage;
            return new GEOM.Point(newX, newY);
        };

        /**
         *
         * @param pt2 : GEOM.Point
         * @param percentage : number
         * @returns {GEOM.Point}
         */
        this.interpolate = function (pt2, percentage) {
            var newX = this.x + (pt2.x - this.x) * percentage;
            var newY = this.y + (pt2.y - this.y) * percentage;
            return new GEOM.Point(newX, newY);
        };

        /**
         *
         * @param tX : number
         * @param tY : number
         */
        this.translate = function (tX, tY) {
            var pX = this.x + tX;
            var pY = this.y + tY;
            this.x = pX;
            this.y = pY;
        };
    },

    /**
     *
     * @param width : number
     * @param height : number
     * @returns {GEOM.Point}
     * @constructor
     */
    RandomPoint: function (width, height) {
        var newX = Math.random() * width;
        var newY = Math.random() * height;
        return new GEOM.Point(newX, newY);
    },

    /**
     *
     * @param x : number
     * @param y : number
     * @constructor
     */
    Vector: function (x, y) {
        this.x = x || 0;
        this.y = y || 0;

        /**
         *
         * @param percentage : number
         * @returns {GEOM.Vector}
         * @constructor
         */
        this.Interpolate = function (percentage) {
            return new GEOM.Vector(this.x * percentage, this.y * percentage);
        };

        /**
         *
         * @returns {GEOM.Vector}
         */
        this.clone = function () {
            return new GEOM.Vector(this.x, this.y);
        };
    }
};
