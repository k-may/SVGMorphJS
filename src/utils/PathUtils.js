import {GEOM} from './GeomUtils.js';

export const PathUtils = {

    /**
     * SVG Parsing utils
     */
    SVG: {

        /**
         *
         * @param data : SVGElement
         * @returns {GEOM.Rectangle}
         */
        getBoundingBox: function (data) {
            var svg = data.getElementsByTagName('svg')[0];
            var attributes = svg.attributes;
            var viewbox = PathUtils.SVG.getViewbox(svg);
            var x = (viewbox && viewbox[0]) || PathUtils.SVG.getNodeValue(attributes, 'x') || 0;
            var y = (viewbox && viewbox[1]) || PathUtils.SVG.getNodeValue(attributes, 'y') || 0;
            var width = (viewbox.length && viewbox[2]) || PathUtils.SVG.getNodeValue(attributes, 'width') || 100;
            var height = (viewbox.length && viewbox[3]) || PathUtils.SVG.getNodeValue(attributes, 'height') || 100;
            //trace("PAth BB : x:" + x + " y:" + y + " width:" + width + " height:" + height);
            return new GEOM.Rectangle(x, y, width, height);
        },

        /**
         *
         * @param attributes
         * @param name
         * @returns {null|number}
         */
        getNodeValue: function (attributes, name) {
            if (attributes[name]) {
                return parseInt(attributes[name].nodeValue);
            }
            return null;
        },

        /**
         *
         * @param svg
         * @returns {number[]}
         */
        getViewbox: function (svg) {
            var viewbox = svg.getAttribute('viewBox');
            if (viewbox) {
                viewbox = viewbox.split(' ');
                viewbox = viewbox.map(value => {
                    return parseInt(value);
                });
            }
            return viewbox;
        },


        /**
         * Extracts svg paths from svg document(s)
         * @param data
         * @return SVGElement[]
         */
        getPaths: function (data) {
            if (data.length) {
                var svg = data.map(document => {
                    return document[i].getElementsByTagName('svg')[0]
                });
            }
        },

        /**
         * Returns all shapes converted to the path format.
         * todo : return arr in order of svg
         * @param svg
         * @returns {string[]}
         */
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
                arr.push('M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2);
            }

            var polylines = svg.getElementsByTagName('polyline');
            for (i = 0; i < polylines.length; i++) {

                var points = polylines[i].getAttribute('points');
                points = points.replace(/\s\s+/g, ' ');
                points = points.split(' ');

                var x = parseFloat(points.shift());
                var y = parseFloat(points.shift());
                var path = 'M' + x + ' ' + y + ' ';

                while (points.length) {
                    x = parseFloat(points.shift());
                    y = parseFloat(points.shift());
                    path += 'L ' + x + ' ' + y + ' ';
                }
                //remove last space
                path = path.substr(0, path.length - 2);
                arr.push(path);
            }

            var polygons = svg.getElementsByTagName('polygon');
            for (i = 0; i < polygons.length; i++) {

                var points = polygons[i].getAttribute('points');
                points = points.replace(/\s\s+/g, ' ');
                points = points.split(' ');

                var x = parseFloat(points.shift());
                var y = parseFloat(points.shift());
                var path = 'M' + x + ' ' + y + ' ';

                while (points.length) {
                    //pt = points.shift().split(",");
                    //if(pt.length){
                    x = parseFloat(points.shift());
                    y = parseFloat(points.shift());
                    path += 'L ' + x + ' ' + y + ' ';
                    //}
                }
                //remove last space
                path = path.substr(0, path.length - 2);
                arr.push(path);
            }
            var rects = svg.getElementsByTagName('rect');
            for (var i = 0; i < rects.length; i++) {
                var rect = rects[i];
                var x = parseFloat(rect.getAttribute('x'));
                var y = parseFloat(rect.getAttribute('y'));
                var width = parseFloat(rect.getAttribute('width'));
                var height = parseFloat(rect.getAttribute('height'));
                var path = 'M' + x + ' ' + y;
                path += 'L' + (x + width) + ' ' + y + ' ';
                path += 'L' + (x + width) + ' ' + (y + height) + ' ';
                path += 'L' + x + ' ' + (y + height) + ' ';
                path += 'L' + x + ' ' + y;
                arr.push(path);
            }

            //todo convert all primitives to paths
            //for other conversions see : https://github.com/JFXtras/jfxtras-labs/blob/2.2/src/main/java/jfxtras/labs/util/ShapeConverter.java

            return arr;
        },

        getPathStr(str) {
            return str;
        },

        getPolygonStr(str) {
            //tbd
        }
    },

    PATH: {

        /**
         *
         * @param d : string
         * @constructor
         */
        PathParser: function (d) {
            //console.log("d ===! : " + d);
            var _d = d || '';
            this.tokens = _d.split(' ');
            //console.dir(this.tokens);

            this.reset = function () {
                this.i = -1;
                this.command = '';
                this.previousCommand = '';
                this.start = new GEOM.Point(0, 0);
                this.control = new GEOM.Point(0, 0);
                this.current = new GEOM.Point(0, 0);
                this.points = [];
                this.angles = [];
            };

            /**
             *
             * @return {boolean}
             */
            this.isEnd = function () {
                return this.i >= this.tokens.length - 1;
            };

            /**
             *
             * @return {boolean}
             */
            this.isCommandOrEnd = function () {
                if (this.isEnd())
                    return true;
                return this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null;
            };

            /**
             *
             * @return {boolean}
             */
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

            /**
             *
             * @return {string}
             */
            this.getToken = function () {
                this.i++;
                return this.tokens[this.i];
            };

            /**
             *
             * @return {number}
             */
            this.getScalar = function () {
                return parseFloat(this.getToken());
            };

            /**
             *
             */
            this.nextCommand = function () {
                this.previousCommand = this.command;
                this.command = this.getToken();
            };

            /**
             *
             * @return {GEOM.Point}
             */
            this.getPoint = function () {
                var p = new GEOM.Point(this.getScalar(), this.getScalar());
                return this.makeAbsolute(p);
            };

            /**
             *
             * @return {GEOM.Point}
             */
            this.getAsControlPoint = function () {
                var p = this.getPoint();
                this.control = p;
                return p;
            };

            /**
             *
             * @return {GEOM.Point}
             */
            this.getAsCurrentPoint = function () {
                var p = this.getPoint();
                this.current = p;
                return p;
            };

            /**
             *
             * @return {GEOM.Point|GEOM.Point}
             */
            this.getReflectedControlPoint = function () {
                if (this.previousCommand.toLowerCase() != 'c' && this.previousCommand.toLowerCase() != 's') {
                    return this.current;
                }
                // reflect point
                return new GEOM.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);
            };

            /**
             *
             * @param p : GEOM.Point
             * @return {GEOM.Point}
             */
            this.makeAbsolute = function (p) {
                if (this.isRelativeCommand()) {
                    p.x += this.current.x;
                    p.y += this.current.y;
                }
                return p;
            };

            /**
             *
             * @param p : GEOM.Point
             * @param from : GEOM.Point
             * @param priorTo : GEOM.Point
             */
            this.addMarker = function (p, from, priorTo) {
                // if the last angle isn't filled in because we didn't have this point yet ...
                if (priorTo != null && this.angles.length > 0 && this.angles[this.angles.length - 1] == null) {
                    this.angles[this.angles.length - 1] = this.points[this.points.length - 1].angleTo(priorTo);
                }
                this.addMarkerAngle(p, from == null ? null : from.angleTo(p));
            };

            /**
             *
             * @param p : GEOM.Point
             * @param a : number
             */
            this.addMarkerAngle = function (p, a) {
                this.points.push(p);
                this.angles.push(a);
            };

            /**
             *
             * @return {GEOM.Point[]}
             */
            this.getMarkerPoints = function () {
                return this.points;
            };

            /**
             *
             * @return {number[]}
             */
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

        /**
         *
         * @param paths : PathUtils.PATH[]
         * @return {PathUtils.PATH[]}
         * @constructor
         */
        ClonePaths: function (paths) {
            var newPaths = []
            for (var i = 0; i < paths.length; i++) {
                newPaths.push(paths[i]);
            }
            return newPaths;
        }

    }
}
