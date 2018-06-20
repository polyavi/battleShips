export default (Data) => {
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
		};

		var p = Preloader.prototype = new createjs.Container();
		p.width = 400;
		p.height = 40;
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
		};

		p.drawPreloader = function () {
			var outline = new createjs.Shape();
			outline.graphics.beginStroke(this.strokeColor);
			outline.graphics.drawRect(0, 0, this.width, this.height);

			this.bar = new createjs.Shape();
			this.bar.graphics.beginFill(this.fillColor);
			this.bar.graphics.drawRect(0, 0, this.width, this.height);
			this.bar.scaleX = 0;
			this.addChild(this.bar, outline);
		};

		p.update = function (perc) {
			perc = perc > 1 ? 1 : perc;
			this.bar.scaleX = perc;
		};

		bts.onFileProgress = function (e) {
			Data.preloader.update(e.progress);
		};

		bts.preload = function () {
			Data.queue = new createjs.LoadQueue();
			Data.queue.loadManifest(Data.images, false);

			Data.init();
		};
		// add to namespace
		bts.Preloader = Preloader;
	}());
};