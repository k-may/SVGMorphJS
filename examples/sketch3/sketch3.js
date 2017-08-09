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

	b = new Buffer();
	b.resize(500, 500);
	document.body.appendChild(b.canvas);

	p1 = new Buffer();
	p1.resize(500, 500);

	p2 = new Buffer();
	p2.resize(500, 500);

	var paths = MORPH.LoadShape(['path3.svg', 'path4.svg', 'path5.svg', 'path6.svg', 'path7.svg', 'path8.svg']).then(paths => {
		morph = new MORPH.Morph(paths, {looping:true, duration:duration}).start();
	});

	loop();
}

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