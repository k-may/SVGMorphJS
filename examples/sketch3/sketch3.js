/**
 * Created by kev on 15-10-07.
 */
/**
 * Created by kev on 15-10-06.
 */

var morph;
var b, p1, p2, current;
var duration = 10000;
var time = 0;

function init() {

	b = new MORPH.CanvasUtils.CreateBuffer();
	b.resize(500, 500);

	window.onresize = function () {
		b.resize(window.innerWidth, window.innerHeight);
	};

	document.body.appendChild(b.canvas);

	var paths = MORPH.LoadSVG(['circle.svg', 'drop.svg'], function (paths) {
		morph = new MORPH.Morph(paths, {looping:true, duration:duration}).start();
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


/*

function loop() {

	var time = Date.now()*0.001;//(Date.now()%duration)/duration;

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
	current.ctx.globalAlpha = 0.99;

	current.ctx.save();
	current.ctx.translate(250, 250);
	current.ctx.rotate(0.007);
//	current.ctx.translate();
	current.ctx.drawImage(next.canvas, -250, -250);
	current.ctx.restore();
	current.ctx.lineWidth = 3;
	current.ctx.strokeStyle = "rgb("
		+ (100 + Math.floor(Math.sin(time)*100)) + ","
		+ (100 + Math.floor(Math.sin(time)*30)) + ","
		+ (100 + Math.floor(Math.sin(time*2)*70))
		+ ")";

	current.ctx.globalAlpha = 1;

	if (morph) {
		var start = true;
		var shapes = morph.getShape();
		var segmentCollection = shapes.segmentCollection;

		current.ctx.beginPath();

		for (var i = 0; i < segmentCollection.length; i++) {
			var segment = segmentCollection[i];

			if (start) {
				start = false;
				current.ctx.moveTo(segment.pt1.x, segment.pt1.y);
			}
			current.ctx.bezierCurveTo(segment.ctrl1.x, segment.ctrl1.y, segment.ctrl2.x, segment.ctrl2.y, segment.pt2.x, segment.pt2.y);
		}

		current.ctx.stroke();
	}


	this.b.clear();
	this.b.ctx.drawImage(current.canvas, 0, 0);

	MORPH.update();

	window.requestAnimationFrame(loop);
}
*/


init();