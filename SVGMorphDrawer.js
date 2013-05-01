var MorphDrawer = function() {
	this.shapeArr = new Array();

	var l = 10;

	var colors = ColorUtils.GenerateRainbow(l);

	this.addShape = function(segs) {
		if (this.shapeArr.length >= l)
			this.shapeArr.pop();

		this.shapeArr.unshift(segs);
	}

	this.draw = function(p) {
		var percentage;
		for (var j = 0; j < this.shapeArr.length; j++) {
			percentage = j / l;
			percentage *= percentage;
			p.strokeWeight(1);
			p.stroke(colors[j].r, colors[j].g, colors[j].b, (1 - percentage) * 255);
			p.beginShape();
			var morphObjs = this.shapeArr[j];
			
			for (var i = 0; i < morphObjs.length; i++) {

				var segs = morphObjs[i];
				for (var s = 0; s < segs.length; s++) {
					var seg = segs[s];
					seg.draw(p);
					/*if (seg.isCurve()) {
						p.curveVertex(seg.pt1.x, seg.pt1.y);
						p.curveVertex(seg.ctrl1.x, seg.ctrl1.y);

						p.curveVertex(seg.ctrl2.x, seg.ctrl2.y);
						p.curveVertex(seg.pt2.x, seg.pt2.y);
					} else {
						p.vertex(seg.pt1.x, seg.pt1.y);
						p.vertex(seg.pt2.x, seg.pt2.y);
					}*/
				}
				p.endShape();
			}
		}
	}
}