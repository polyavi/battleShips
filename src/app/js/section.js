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
			section.addEventListener('click', this.handleInteraction);

			this.addChild(section);
		}

		p.handleInteraction = function(e){
			if(bts.startPos.mouseX == bts.stage.mouseX && bts.startPos.mouseY == bts.stage.mouseY){
				let targetShip = e.target.parent.getTargetShip();
				if(targetShip){
					if(isTargetInRange(e.target.parent)) attackOponent(targetShip);
				}else{
					createjs.Tween.removeAllTweens();
					bts.moveToNextPosition(bts.myship, {x: bts.myship.children[0].x, y: bts.myship.children[0].y},{x: e.target.graphics.command.x, y: e.target.graphics.command.y});
					bts.myship.position = e.target.parent;
				}
			}
		}

		p.checkForPowerUp = function(ship){
			if(this.powerup == 'speed'){
				ship.increaseSpeed();
			}else if(this.powerup == 'range'){
				ship.increaseRange();
			}else	if(this.powerup == 'life'){
				ship.fillLife();
			}else	if(this.powerup == 'monitions'){
				ship.increaseMonitions(3);
			}
			if(this.powerup){
				this.powerup = '';
				createjs.Tween.get(this)
					.to({alpha: 1}, 500, createjs.Ease.sinIn)
			}
		}

		p.getTargetShip = function(){
			let ships = bts.stage.children.filter((child) =>{ return child.name =='oponent ship'});
			if(ships){
				return ships.find( function(ship) {
					return (ship.position.graphics.command.x == this.section.graphics.command.x && ship.position.graphics.command.y == this.section.graphics.command.y);
				});
			}
		}

		p.isTargetInRange	= function(){
			let targetPosition = this.section.graphics.command;

			return !!bts.myship.sectionsInRange.find(section => { return section.hitTest(targetPosition.x, targetPosition.y)});
		}

		bts.Section = Section;
	}())
}