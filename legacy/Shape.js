/**
 * Created by kev on 16-04-06.
 */
MORPH.Shape = function (segmentCollection) {
	this.segmentCollection = segmentCollection || [];
	this.length = this.segmentCollection.length;
};
MORPH.Shape.prototype = {
	translate: function (x, y) {
		for(var i = 0 ;i < this.length; i ++){
			this.segmentCollection[i].translate(x, y);
		}
	},
	scale: function (scale) {
		for(var i = 0 ;i < this.length; i ++){
			this.segmentCollection[i].scale(scale);
		}
	},
	clone:function(){
		/*var segmentCollection = this.segmentCollection.map(function(segment){
			return segment.clone();
		});*/
		var segmentCollection = [];
		for(var i = 0 ;i < this.length; i ++){
			segmentCollection.push(this.segmentCollection[i].clone());
		}
		return new MORPH.Shape(segmentCollection);
	}
};
