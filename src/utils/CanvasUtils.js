export const CanvasUtils = {

	/**
	 *
	 * @returns {boolean|{canvas: HTMLCanvasElement,
	 * ctx: CanvasRenderingContext2D,
	 * width: number,
	 * clear: clear, resize: resize,
	 * getPixelRatio: (function(): number),
	 * resizeToDisplaySize(): boolean,
	 * invalidated: boolean,
	 * fill: fill,
	 * height: number}}
	 * @constructor
	 */
	CreateBuffer: function () {

		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");

		return {
			canvas: canvas,
			ctx: ctx,
			width: -1,
			height: -1,
			invalidated: false,

			/**
			 * Resizes canvas (preferred method)
			 * @returns {boolean}
			 */
			resizeToDisplaySize() {
				this.devicePixelRatio = this.getPixelRatio();
				const width = (canvas.clientWidth * this.devicePixelRatio) | 0;
				const height = (canvas.clientHeight * this.devicePixelRatio) | 0;
				if (canvas.width !== width || canvas.height !== height) {
					canvas.width = this.width = width;
					canvas.height = this.height = height;
					return true;
				}
				return false;
			},

			/**
			 * Resizes canvas (only if different to avoid repaint)
			 * @param w : number
			 * @param h : number
			 * @returns {boolean}
			 */
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

			/**
			 * Clears the canvas
			 */
			clear: function () {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			},

			/**
			 * Fills canvas with color
			 * @param color : string
			 */
			fill: function (color) {
				this.ctx.fillStyle = color;
				this.ctx.fillRect(0, 0, this.width, this.height);
			},

			/**
			 *
			 * @returns {number}
			 */
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
