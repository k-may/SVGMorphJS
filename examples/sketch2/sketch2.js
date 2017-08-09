/**
 * Created by kev on 15-10-06.
 */

var morph;
var b;

function init() {

	b = new Buffer();
	b.resize(500, 500);

	window.onresize = function () {
		b.resize(window.innerWidth, window.innerHeight);
	};

	document.body.appendChild(b.canvas);

	var paths = MORPH.LoadShape(['path1.svg', 'path2.svg']).then(paths => {
		morph = new MORPH.Morph(paths, {looping: true, duration: 5000}).start();
	});

	loop();
}

function loop() {

	if (morph) {

		var start = true;
		var shapes = morph.getShape();
		var segmentCollection = shapes.segmentCollection;

		b.clear();
		b.ctx.beginPath();

		for (var i = 0; i < segmentCollection.length; i++) {
			var segment = segmentCollection[i];

			if (start) {
				start = false;
				b.ctx.moveTo(segment.pt1.x, segment.pt1.y);
			}

			b.ctx.bezierCurveTo(segment.ctrl1.x, segment.ctrl1.y,
				segment.ctrl2.x, segment.ctrl2.y,
				segment.pt2.x, segment.pt2.y);
		}

		b.ctx.stroke();
	}

	MORPH.update();

	window.requestAnimationFrame(loop);
}

function Buffer() {
	this.canvas = document.createElement("canvas");
	this.ctx = this.canvas.getContext("2d");
	this.clear = function () {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	this.resize = function (width, height) {
		if (this.canvas.width !== width || this.canvas.height !== height) {
			this.canvas.width = width;
			this.canvas.height = height;
		}
	}
}

init();