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
var b, p1, p2, current;
var duration = 1000;

function init() {

    const {
        CanvasUtils
    } = SVGMORPH;

    b = new SVGMORPH.CanvasUtils.CreateBuffer();
	b.resize(500, 500);

    p1 = new SVGMORPH.CanvasUtils.CreateBuffer();
    p1.resize(500, 500);

    p2 = new SVGMORPH.CanvasUtils.CreateBuffer();
    p2.resize(500, 500);

	window.onresize = function () {
		b.resize(window.innerWidth, window.innerHeight);
	};

	document.body.appendChild(b.canvas);

	var paths = SVGMORPH.LoadShape(['drop.svg','circle.svg','square.svg'])
	.then(paths => {
		morph = new SVGMORPH.Morph(paths, {looping:true, duration:duration}).start();
	});

	loop();
}

function draw({time,deltaTime}) {

    //draw persistent
    var next;
    if (current === p1) {
        current = p2;
        next = p1;
    } else {
        current = p1;
        next = p2;
    }

    current.clear();
    current.ctx.globalAlpha = 0.9;
    current.ctx.drawImage(next.canvas, 0, 0);

    current.ctx.globalAlpha = 1;
    current.ctx.lineWidth = 3;
    current.ctx.strokeStyle = "0x000000";


	if (morph) {

        current.ctx.beginPath();

        var start = true;
		var shapes = morph.getShape();
		var segmentCollection = shapes.segmentCollection;


		// b.clear();
		// b.ctx.beginPath();

		for (var i = 0; i < segmentCollection.length; i++) {
			var segment = segmentCollection[i];

			if (start) {
				start = false;
                current.ctx.moveTo(segment.pt1.x, segment.pt1.y);
			}

            current.ctx.bezierCurveTo(segment.ctrl1.x, segment.ctrl1.y,
				segment.ctrl2.x, segment.ctrl2.y,
				segment.pt2.x, segment.pt2.y);
		}
		//b.ctx.stroke();
        current.ctx.stroke();
    }

    b.clear();
    b.ctx.drawImage(current.canvas, 0, 0);

	SVGMORPH.update({time,deltaTime});
}


init();