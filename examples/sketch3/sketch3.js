/**
 * Created by kev on 15-10-07.
 */

var morph;
var b;//, p1, p2, current;
var duration = 10000;

function init() {

	b = new MORPH.CanvasUtils.CreateBuffer();
	b.resize(500, 500);

	window.onresize = function () {
		b.resize(window.innerWidth, window.innerHeight);
	};

	document.body.appendChild(b.canvas);

	var paths = MORPH.LoadPaths(['drop.svg','circle.svg'])
	.then(function (paths) {
		morph = new MORPH.Morph(paths, {looping:false, duration:duration}).start();
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


init();