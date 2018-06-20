/**
 * @module BattleShips
 */
export default (Data) => {
	window.bts = window.bts || {};

	(function () {
		'use strict';
		/**
		 * @namespace bts
		 * @class bts.Field
		 * @extends {createjs.Container}
		 * @constructor
		 */
		let Field = function () {
			// :properties

			this.center = Data.canvasCenter;
			this.size = Data.fieldSize;

			this.initialize();
		};

		let p = Field.prototype = new createjs.Container();
		p.Container_initialize = p.initialize;
		// :methods
		/**
		 * Initialize the section
		 *
		 * @method init
		 */

		p.initialize = function () {
			this.Container_initialize();
			this.drawField();
		};

		/**
		 * Draws all sections and the sand border around the field
		 *
		 * @method drawField
		 */
		p.drawField = function () {
			let i = 0;
			for (let j = 0; j < this.size * 2 + 2; j += 1) {
				drawSand(-76, -44 + 87 * j);
			}
			while (i < this.size * 3 / 2) {
				p.drawLineOfSections({
					x: 152 * i,
					y: 0
				}, this.size * 2, 87);
				p.drawLineOfSections({
					x: 76 + 152 * i,
					y: 44
				}, this.size * 2, 87);
				i += 1;
			}
			for (let j = 0; j < this.size * 2 + 2; j += 1) {
				drawSand(152 * this.size * 3 / 2 + 1, 87 * (j - 1));
			}
			this.addChild(...Data.sections);
			this.name = 'field';

			Data.stage.addChild(this);
		};

		/**
		 * Draws a sand section 
		 *
		 * @method drawLineOfSections
		 * @param {Object}  startingPoint  Position at which the fist section is drawn
		 * @param {Number} numberofSections 
		 * @param {Number} step Distance between each new position
		 */
		p.drawLineOfSections = function (startingPoint, numberofSections, step) {
			drawSand(startingPoint.x, startingPoint.y - step);
			drawSand(startingPoint.x, startingPoint.y + step * numberofSections);

			for (let i = 0; i < numberofSections; i += 1) {
				let section = new bts.Section({
					x: startingPoint.x,
					y: startingPoint.y + step * i
				});
				Data.sections.push(section);
				section.alpha = 0;
			}
		};

		/**
		 * Positions the power ups on the map
		 *
		 * @method setPowerUpsInField
		 * @param {Object}  powerups  Object containing the section index and type of power up
		 */
		p.setPowerUpsInField = function (powerups) {
			let length = powerups.length;
			for (let i = 0; i < length; i += 1) {
				let section = this.children[powerups[i].section];
				section.addPowerUp(powerups[i]);
			}
		};

		/**
		 * Positions the mines on the map
		 *
		 * @method setMines
		 * @param {Array}  mines  Array of the section indexes
		 */
		p.setMines = function (mines) {
			let length = mines.length;
			for (let i = 0; i < length; i += 1) {
				let section = this.children[mines[i]];
				section.mine = true;
			}
		};

		/**
		 * Draws a sand section 
		 *
		 * @method drawSand
		 * @param {Number} x horizontal position
		 * @param {Number} y vertical position
		 */
		function drawSand(x, y) {
			let sand = new createjs.Shape();
			sand.graphics.beginBitmapFill(Data.sand).beginStroke('#E4B363').drawPolyStar(x, y, 50, 6, 0, 0);
			sand.alpha = 0;
			Data.sandBorder.push(sand);
		}
		bts.Field = Field;
	}());
};