/**
 * Created by kev on 15-10-07.
 */

var morph;
var b, p1, p2, current;
var duration = 1000;

function init() {

	b = new MORPH.CanvasUtils.CreateBuffer();
	b.resize(500, 500);

    p1 = new MORPH.CanvasUtils.CreateBuffer();
    p1.resize(500, 500);

    p2 = new MORPH.CanvasUtils.CreateBuffer();
    p2.resize(500, 500);

	window.onresize = function () {
		b.resize(window.innerWidth, window.innerHeight);
	};

	document.body.appendChild(b.canvas);

	var paths = MORPH.LoadShape(['drop.svg','circle.svg','square.svg'])
	.then(paths => {
		morph = new MORPH.Morph(paths, {looping:true, duration:duration}).start();
	});

	loop();
}

function loop() {

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

    this.b.clear();
    this.b.ctx.drawImage(current.canvas, 0, 0);

	MORPH.update();

	window.requestAnimationFrame(loop);
}


init();