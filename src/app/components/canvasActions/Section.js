/**
 * @module BattleShips
 */
export default () => {
	window.bts = window.bts || {};

	(function() {
		'use strict';
		/**
		 * @namespace bts
		 * @class bts.Section
		 * @extends {createjs.Container}
		 * @constructor
		 */
		let Section = function(position) {
			// :properties
			this.powerup = '';
			this.neighbors = [];
			this.initialize(position);
		};

		let p = Section.prototype = new createjs.Container();

		p.Container_initialize = p.initialize;
		// :methods
		/**
		 * Initialize the section
		 *
		 * @method init
		 */
		p.initialize = function(position) {
			this.Container_initialize();
			this.drawSection(position);
		};

		/**
		 * Draws Section
		 *
		 * @method drawSection
		 * @param {Object} position coordinates
		 */
		p.drawSection = function(position) {
			let section = new createjs.Shape();
			section.graphics.beginBitmapFill(bts.backgroundImage).beginStroke(bts.strokeColor).drawPolyStar(position.x, position.y, 50, 6, 0, 0);
			this.addChild(section);
		};

		/**
		 * Handles click on Section
		 *
		 * @method handleInteraction
		 * @param {Object} e event object
		 */
		p.handleInteraction = function(e) {
			if (bts.startPos.mouseX == bts.stage.mouseX && bts.startPos.mouseY == bts.stage.mouseY) {
				let target = (e.target.parent.name == 'powerup') ? e.target.parent.parent.children[0] : e.target.parent.children[0];
				let targetShip = target.parent.getTargetShip();
				if (targetShip) {
					if (isTargetInRange(targetShip.position) && bts.myship.monitions > 0) {
						targetShip.explodingAnimation();
						bts.myship.attackOponent(targetShip);
					}
				} else {
					bts.myship.prevPos = [];
					bts.moveToNextPosition(bts.myship, {
						x: bts.myship.children[0].x,
						y: bts.myship.children[0].y
					}, {
						x: target.graphics.command.x,
						y: target.graphics.command.y
					});

					window.socket.emit(
						'move', {
							x: bts.myship.children[0].x,
							y: bts.myship.children[0].y
						}, {
							x: target.graphics.command.x,
							y: target.graphics.command.y
						}
					);
				}
			}
		};

		/**
		 * Checks if there is power up in the Section, determines if it shoud send socket event and removes power up
		 *
		 * @method checkForPowerUp
		 * @param {Ship} ship 
		 */
		p.checkForPowerUp = function(ship) {
			if (this.powerup) {
				if (ship.name == bts.me) {
					window.socket.emit('collect powerup', this.powerup);
				}
				this.removePowerUp();
			}
		};

		/**
		 * @method removePowerUp
		 */
		p.removePowerUp = function() {
			this.powerup = undefined;
			this.removeChild(this.getChildByName('powerup'));
		};
		/**
		 * @method addPowerUp
		 * @param {Object} powerup 
		 */
		p.addPowerUp = function(powerup) {
			let text = new createjs.Container();
			if (powerup.type == 'life') {
				this.drawPowerUp('1Up', text);
			} else if (powerup.type == 'monitions') {
				this.drawPowerUp('moni', text);
				this.drawPowerUp('tions', text, 2);
			} else if (powerup.type == 'speed') {
				this.drawPowerUp('speed', text);
			} else if (powerup.type == 'range') {
				this.drawPowerUp('range', text);
			}

			this.addChild(text);
			createjs.Tween.get(text)
				.to({
					alpha: 1
				}, 500, createjs.Ease.sinIn);
			this.powerup = powerup;
		};

		/**
		 * Checks if there is a ship in the Section and returns it
		 * 
		 * @method getTargetShip
		 */
		p.getTargetShip = function() {
			let ships = bts.stage.getChildByName('ships').children.filter((child) => {
				return child.name != bts.me;
			});

			let self = this;
			if (ships) {
				return ships.find((ship) => {
					return (ship.position.children[0].graphics.command.x == self.children[0].graphics.command.x && ship.position.children[0].graphics.command.y == self.children[0].graphics.command.y);
				});
			}
		};

		/**
		 * @method isTargetInRange
		 * @param {Section} section
		 */
		function isTargetInRange(section) {
			return !!(
				bts.myship.sectionsInRange.find(section => {
					return section.id == section.id;
				})
			);
		}

		/**
		 * @method drawPowerUp
		 * @param {String} name the type of power up
		 * @param {String} text the test to by drawn
		 * @param {Number} i Number of line
		 */
		p.drawPowerUp = function(name, text, i = 1) {
			let powerUpText = new createjs.Text(name, '25px monospace', '#EF6461');
			let powerUpOtuline = new createjs.Text(name, '25px monospace', '#FFF');
			powerUpOtuline.outline = 2;
			text.addChild(powerUpOtuline, powerUpText);
			if (i == 2) {
				powerUpText.y = powerUpText.getMeasuredHeight();
				powerUpOtuline.y = powerUpText.getMeasuredHeight();
			}
			text.name = 'powerup';
			text.x = this.children[0].graphics.command.x - powerUpText.getMeasuredWidth() / 2;
			text.y = this.children[0].graphics.command.y - powerUpText.getMeasuredHeight();
		};

		/**
		 * Gets the 6 surrounding section of the given one
		 *
		 * @method getNeighbors
		 */
		p.getNeighbors = function() {
			let neighbors = [];
			let sectionIndex = bts.sections.indexOf(this);
			if(sectionIndex%24 == 0){
				neighbors = [
					bts.sections[sectionIndex + 1],
					bts.sections[sectionIndex + bts.fieldSize * 2],
					bts.sections[sectionIndex - bts.fieldSize * 2]
				];
				if(!sectionIndex/24%2 == 0){
					neighbors.push(bts.sections[sectionIndex - (bts.fieldSize * 2 + Math.pow(-1, Math.floor(sectionIndex / 24)))]);
					neighbors.push(bts.sections[sectionIndex + (bts.fieldSize * 2 - Math.pow(-1, Math.floor(sectionIndex / 24)))]);
				}
			}else if(sectionIndex%24 == 23){
				neighbors = [
					bts.sections[sectionIndex - 1],
					bts.sections[sectionIndex - (bts.fieldSize * 2 + Math.pow(-1, Math.floor(sectionIndex / 24)))],
					bts.sections[sectionIndex + (bts.fieldSize * 2 - Math.pow(-1, Math.floor(sectionIndex / 24)))]
				];
				if(!Math.floor(sectionIndex/24)%2 == 0){
					neighbors.push(bts.sections[sectionIndex + bts.fieldSize * 2]);
					neighbors.push(bts.sections[sectionIndex - bts.fieldSize * 2]);
				}
			}else {
				neighbors = [
					bts.sections[sectionIndex - 1],
					bts.sections[sectionIndex + 1],
					bts.sections[sectionIndex - bts.fieldSize * 2],
					bts.sections[sectionIndex + bts.fieldSize * 2],
					bts.sections[sectionIndex - (bts.fieldSize * 2 + Math.pow(-1, Math.floor(sectionIndex / 24)))],
					bts.sections[sectionIndex + (bts.fieldSize * 2 - Math.pow(-1, Math.floor(sectionIndex / 24)))]
				];
			}
			
			return neighbors.filter(section => {
				return section && section instanceof bts.Section && section.occupied != true;
			});
		};
		/**
			* Gets a section by given coordinates
			*
			* @method getSectionByCoordinates
			* @param {Number} x 
			* @param {Number} y 
			*/
		bts.getSectionByCoordinates = function(x, y){
			return bts.stage.getChildByName('field').children.find((section) => {
			 return section.children[0].hitTest(x, y) == true;
			});
		};
		/**
		 * Positions the obsticles/rock
		 *
		 * @method drawRock
		 * @param {Object}  position  Object with x and y coordinates
		 */
		p.drawRock = function(){
			let rock = new createjs.Container();
			let bitmap = new createjs.Bitmap(bts.rock);
			bitmap.scaleX = bitmap.scaleY = 0.1;

			bitmap.x = this.children[0].graphics.command.x - bitmap.image.naturalWidth*0.1/2;
			bitmap.y = this.children[0].graphics.command.y - bitmap.image.naturalHeight*0.1/2;

			rock.addChild(bitmap);
			rock.name = 'rock';
			this.occupied = true;
			this.addChild(rock);
		};

		bts.getDistanceBetweenSections = function(startSection, endSection){
			return {
				section: startSection,
				distance: Math.abs(startSection.children[0].graphics.command.x -
					endSection.children[0].graphics.command.x) + Math.abs(startSection.children[0].graphics.command.y -
					endSection.children[0].graphics.command.y)
			};
		};
		bts.Section = Section;
	}());
};