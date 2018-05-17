/**
 * @module BattleShips
 */
export default ()=>{
  window.bts = window.bts || {};

	(function () {
		'use strict';
		/**
		 * @namespace bts
		 * @class bts.Section
		 * @extends {createjs.Container}
		 * @constructor
		 */
		let Section = function (position) {
			// :properties
			this.powerup = '';

			this.initialize(position);
		}

		let p = Section.prototype = new createjs.Container();

		p.Container_initialize = p.initialize;
		// :methods
		/**
		 * Initialize the section
		 *
		 * @method init
		 */
		p.initialize = function (position) {
			this.Container_initialize();
			this.drawSection(position);
		}
	 
		p.drawSection = function(position){
			let section = new createjs.Shape();

			section.graphics.beginBitmapFill(bts.backgroundImage).beginStroke(bts.strokeColor).drawPolyStar(position.x, position.y, 50, 6, 0, 0);
			section.name = 'section';

			this.addChild(section);
		}

		p.handleInteraction = function(e){
			if(bts.startPos.mouseX == bts.stage.mouseX && bts.startPos.mouseY == bts.stage.mouseY){
				let targetShip = e.target.parent.getTargetShip();
				if(targetShip){
					if(isTargetInRange(targetShip.position)) bts.myship.attackOponent(targetShip);
				}else{
					bts.moveToNextPosition(bts.myship, {x: bts.myship.children[0].x, y: bts.myship.children[0].y},{x: e.target.graphics.command.x, y: e.target.graphics.command.y});

					window.socket.emit(
						'move', 
						{
							x: bts.myship.children[0].x - bts.canvasCenter.x, 
							y: bts.myship.children[0].y - bts.canvasCenter.y
						},
						{
							x: e.target.graphics.command.x - bts.canvasCenter.x, 
							y: e.target.graphics.command.y - bts.canvasCenter.y
						}
					)
				}
			}
		}

		p.checkForPowerUp = function(ship){
			if(this.powerup){
				if(ship.name == bts.me){
					window.socket.emit('collect powerup', this.powerup);
					this.removePowerUp();
				}
			}	
		}

		p.removePowerUp = function(){
			this.powerup.delete;

			createjs.Tween.get(this)
				.to({alpha: 1}, 500, createjs.Ease.sinIn)
		}

		p.addPowerUp = function(powerup){
			createjs.Tween.get(this)
				.to({alpha: 0.5}, 500, createjs.Ease.sinIn)
			this.powerup = powerup;
		}

		p.getTargetShip = function(){
			let ships = bts.stage.getChildByName('ships').children.filter((child) =>{ 
				return child.name != bts.me;
			});

			let self = this;
			if(ships){
				return ships.find((ship) =>{
					return (ship.position.children[0].graphics.command.x == self.children[0].graphics.command.x && ship.position.children[0].graphics.command.y == self.children[0].graphics.command.y);
				});
			}
		}

		function isTargetInRange(position){
			return !!(
				bts.myship.sectionsInRange.find(section => { 
					return section.id == position.id;
				})
			);
		}

		bts.Section = Section;
	}())
}