export default class Shape {

    constructor(segmentCollection) {
        this.segmentCollection = segmentCollection || [];
        this.length = this.segmentCollection.length;
    }

    translate(x, y) {
        for (var i = 0; i < this.length; i++) {
            this.segmentCollection[i].translate(x, y);
        }
    }

    scale(scale) {
        for (var i = 0; i < this.length; i++) {
            this.segmentCollection[i].scale(scale);
        }
    }

    clone() {

        var segmentCollection = [];
        for (var i = 0; i < this.length; i++) {
            segmentCollection.push(this.segmentCollection[i].clone());
        }
        return new Shape(segmentCollection);
    }
}