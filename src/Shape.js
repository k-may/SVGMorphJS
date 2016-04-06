/**
 * Created by kev on 16-04-06.
 */
MORPH.Shape = function (segmentCollection) {
	this.segmentCollection = segmentCollection || [];
};
MORPH.Shape.prototype = {
	translate: function (x, y) {
		this.segmentCollection.forEach(function (segment) {
			segment.translate(x, y);
		});
	},
	scale: function (scale) {
		this.segmentCollection.forEach(function (segment) {
			segment.scale(scale);
		});
	}
};
