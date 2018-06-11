export default ()=>{
  window.bts = window.bts || {};

	(function () {
		'use strict';
	/**
	 * @namespace bts
	 * @class bts.Preloader
	 * @extends {createjs.Container}
	 * @constructor
	 */
		var Preloader = function (fill, stroke) {
			this.fillColor = fill;
			this.strokeColor = stroke;
			this.initialize();
		}

		var p = Preloader.prototype = new createjs.Container();
		p.width = 400;
		p.height = 40;
		p.fillColor;
		p.strokeColor;
		p.bar;
		p.Container_initialize = p.initialize;
		// :methods
		/**
		 * Initialize the preloader
		 *
		 * @method init
		 */
		p.initialize = function () {
			this.Container_initialize();
			this.drawPreloader();
		}

		p.drawPreloader = function () {
			var outline = new createjs.Shape();
			outline.graphics.beginStroke(this.strokeColor);
			outline.graphics.drawRect(0, 0, this.width, this.height);

			this.bar = new createjs.Shape();
			this.bar.graphics.beginFill(this.fillColor);
			this.bar.graphics.drawRect(0, 0, this.width, this.height);
			this.bar.scaleX = 0;
			this.addChild(this.bar, outline);
		}

		p.update = function (perc) {
			perc = perc > 1 ? 1 : perc;
			this.bar.scaleX = perc;
		}

		bts.init = function () {
			bts.stage = new createjs.Stage(document.getElementById('canvas'));
			createjs.Ticker.on('tick', bts.stage);
			bts.stage.enableMouseOver();

			bts.preloader = new bts.Preloader('#666','#fff');
			bts.preloader.x = (bts.stage.canvas.width / 2) - (bts.preloader.width / 2);
			bts.preloader.y = (bts.stage.canvas.height / 2) - (bts.preloader.height / 2);
			bts.stage.addChild(bts.preloader);

			bts.queue.addEventListener('complete', bts.initGame);
			bts.queue.addEventListener('progress', bts.onFileProgress);
			bts.queue.load();
		}

		bts.onFileProgress = function (e) {
			bts.preloader.update(e.progress);
		}

		bts.preload = function () {
			bts.queue = new createjs.LoadQueue();
			bts.queue.loadManifest(bts.images,false);

			bts.init();
		}
		// add to namespace
		bts.Preloader = Preloader;
	}());
}