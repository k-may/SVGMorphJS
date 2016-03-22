var MorphDrawer = function(length, colors, strokeWeight) {
	this.shapeArr = new Array();

	var l = length;
	var _strokeWeight = strokeWeight || 1;
	var _colors = colors || [new Color(0, 0, 0)];

	this.addShape = function(shape) {
		if (this.shapeArr.length >= l)
			this.shapeArr.pop();

		this.shapeArr.unshift(shape);
	}

	this.draw = function(p) {
		var percentage;
		var shape, segCol;
		var morphObjLength, segsLength;
		var shapeLength = this.shapeArr.length;
		var color;
		for (var j = 0; j < shapeLength; j++) {
			percentage = j / l;
			//percentage *= percentage;
			p.strokeWeight(_strokeWeight);
			color = getColor(j);
			p.stroke(color.r, color.g, color.b, color.a);
			shape = this.shapeArr[j];
			for (var i = 0; i < shape.length; i++) {
				var seg = shape.segmentCollection[i];
				seg.draw(p);
			}

		}
	}
	function getColor(index) {
		index = Math.min(_colors.length - 1, index);
		return _colors[index];
	}

}
