/**
 * Created by kev on 16-03-23.
 */

MORPH.CanvasUtils = {
	CreateBuffer: function () {

		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");

		return {
			canvas: canvas,
			ctx: ctx,
			width: -1,
			height: -1,
			invalidated: false,
			resize: function (w, h) {
				if (w && h) {
					w = Math.floor(w);
					h = Math.floor(h);

					if (this.width !== w || this.height !== h) {
						this.canvas.width = w;
						this.canvas.height = h;
						this.width = w;
						this.height = h;
						return true;
					}
				}
				return false;
			},
			clear: function () {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			},
			//for debug!
			fill: function (color) {
				this.ctx.fillStyle = color;
				this.ctx.fillRect(0, 0, this.width, this.height);
			},
			getPixelRatio: function () {
				//http://www.html5rocks.com/en/tutorials/canvas/hidpi/
				var devicePixelRatio = window.devicePixelRatio || 1;
				var backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
					this.ctx.mozBackingStorePixelRatio ||
					this.ctx.msBackingStorePixelRatio ||
					this.ctx.oBackingStorePixelRatio ||
					this.ctx.backingStorePixelRatio || 1;

				var ratio = devicePixelRatio / backingStoreRatio;
				return ratio;
			}
		}
	}
};
