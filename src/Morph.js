import {SVGMORPH} from './Index.js';
import Shape from './Shape.js';

export class Morph{

    /**
     *
     * @param paths :
     * @param obj
     */
    constructor(paths, obj) {
        obj = obj || {};

        this._paths = paths;
        this._current = 0;
        this._morphablePathCollection = [];
        this._ratio = 0;
        this._startTime;
        this._duration = obj["duration"] || 1000;
        this._delayTime = 0;
        this._looping = obj["looping"] || false;
        this._numPaths = this._looping ? this._paths.length + 1 : this._paths.length;
        this._completeCallback = obj["onComplete"];
        this._x = 0;
        this._y = 0;

        this.reset();
    }

    reset () {
        var i = 0;
        if (this._numPaths > 1) {
            this._morphablePathCollection = [];
            while (this._morphablePathCollection.length < this._numPaths - 1) {
                var Morphables = SVGMORPH.createMorphablePath(this._paths[i].getSegments(), this._paths[(i + 1) % this._paths.length].getSegments());
                this._morphablePathCollection.push(Morphables);
                i++;
            }
        } else {
            this._morphablePathCollection.push(this._paths[0]);
        }
    }

    start(time) {
        this._startTime = time !== undefined ? time : window.performance.now();
        this._startTime += this._delayTime;
        SVGMORPH.add(this);

        return this;
    }

    update(time) {
        var isComplete, index = 0;

        var r = Math.max(0, Math.min(1, (time - this._startTime) / this._duration));
        isComplete = this.setRatio(r);

        if (isComplete) {

            if (this._completeCallback != null)
                this._completeCallback();

            if (this._looping) {
                this._startTime = time !== undefined ? time : window.performance.now();
                this._current = 0;
                this._ratio = 0;
                return true;
            }
            return false;
        } else {
            this._current = Math.floor(r * this._paths.length);
        }

        return true;
    }

    getCurrentPath() {
        return this._paths[this._paths.length - 1];
    }

    setRatio(ratio) {
        this._ratio = ratio;
        if (this._numPaths > 1) {
            var index = Math.floor(this._ratio * (this._numPaths - 1));
            return index >= this._numPaths - 1;
        } else {
            return this._ratio >= 1;
        }

    }

    getCurrentRatio() {
        var cR = (this._ratio * (this._numPaths - 1)) - this._current;
        return cR;
    }

    getCurrentMorphablePath() {
        if (this._current < this._morphablePathCollection.length)
            return this._morphablePathCollection[this._current];
        else {
            console.log("Error : something wrong here!");
        }
    }

    getShape() {
        if (this._numPaths > 1)
            return this.currentShape();
        else {
            var path = this._paths[0];
            return new Shape(path.getSegments());
        }
    }

    currentShape() {
        var currentMorphablePathGroups = this.getCurrentMorphablePath().morphableGroups;

        var ratio = this.getCurrentRatio();
        var numSegs = currentMorphablePathGroups.length;
        var segs = [];

        for (var i = 0; i < numSegs; i++) {
            var morphableSegmentGroup = currentMorphablePathGroups[i];
            var morphedSegs = morphableSegmentGroup.interpolate(ratio);
            segs = segs.concat(morphedSegs);
        }

        return new Shape(segs);
    }

    onComplete(callback) {
        this._onCompleteCallback = callback;
        return this;
    }

    setScale(scale) {
        this._paths.forEach(function (path) {
            path.setScale(scale);
        });
        this.reset();
        return this;
    }

    getWidth() {
        var w = 0;
        for (var i = 0; i < this._paths.length; i++) {
            if (this._paths[i].width() > w)
                w = this._paths[i].width();
        }
        return w;
    }

    getHeight() {
        var h = 0;
        for (var i = 0; i < this._paths.length; i++) {
            if (this._paths[i].height() > h)
                h = this._paths[i].height();
        }
        return h;
    }

    translate(x, y) {
        this._x += x;
        this._y += y;
        this._paths.forEach(function (path) {
            path.translate(x, y);
        });
        this.reset();
        return this;
    }

    setOrigin(x, y) {
        var dX = this._x - x;
        var dY = this._y - y;

        /*this._morphablePathCollection.forEach(function(collection){
         collection.morphableGroups.forEach(function(morphableGroup){
         morphableGroup.translate(dX, dY);
         });
         });*/
        this._paths.forEach(function (path) {
            path.translate(dX, dY);
        });
        this.reset();

        return this;
    }

    getX() {
        return this._x;
    }

    getY() {
        return this._y;
    }
}