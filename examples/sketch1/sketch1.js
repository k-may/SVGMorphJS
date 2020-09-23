import {SVGMORPH} from '../svgmorph.js';

const targetFrameRate = 60;
var lastFrameTime = 0;
function loop() {

	var time = window.performance.now();
	const time_since_last = time - lastFrameTime;
	const target_time_between_frames = 1000 / targetFrameRate;

	const epsilon = 5;
	if (
		time_since_last >= target_time_between_frames - epsilon
	) {
		const deltaTime = time - lastFrameTime;
		draw({time,deltaTime});
		lastFrameTime = time;
	}

	window.requestAnimationFrame(loop);
}

var morph;
var b;

function init() {

	const {
		CanvasUtils
	} = SVGMORPH;

	b = CanvasUtils.CreateBuffer();
	b.resize(400, 200);

	window.onresize = function () {
		b.resize(window.innerWidth, window.innerHeight);
	};

	document.body.appendChild(b.canvas);

	var paths = SVGMORPH.LoadShape(['path3.svg', 'path4.svg']).then(paths => {
		morph = new SVGMORPH.Morph(paths, {looping: true, duration: 15000}).start();
	});

	loop();
}


function draw({time,deltaTime}) {

	if (morph) {

		var start = true;
		var shapes = morph.getShape();
		var segmentCollection = shapes.segmentCollection;

		b.clear();
		b.ctx.strokeStyle = "#ff0000";
		b.ctx.lineWidth = 3;
		b.ctx.lineCap = "round";

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

	SVGMORPH.update({time,deltaTime});
}

init();