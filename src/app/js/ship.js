/**
 * @module BattleShips
 */
export default ()=>{
  window.bts = window.bts || {};

	(function () {
		'use strict';
		/**
		 * @namespace bts
		 * @class bts.Ship
		 * @extends {createjs.Container}
		 * @constructor
		 */
		let Ship = function (name, position, playerProps) {
			this.name = name;
			this.speed = playerProps.speed;
			this.monitions = playerProps.monitions;
			this.life = playerProps.life;
			this.range = playerProps.range;
			this.rangeSection = {};

			this.initialize(position);
		}

		let p = Ship.prototype = new createjs.Container();
		p.Container_initialize = p.initialize;
		// :methods
		/**
		 * Initialize the section
		 *
		 * @method init
		 */
		p.initialize = function (position) {
			this.Container_initialize();
			this.drawShip(position);
		}

		p.increaseSpeed = function(){
			this.speed +=1;
		}

		p.resetSpeed = function(){
			this.speed = 1;
		}

		p.decreaseLife = function(){
			this.life -=1;
		}

		p.fillLife = function(){
			this.life = 3;
		}

		p.increaseRange = function(){
			this.range +=1;
		}

		p.resetRange = function(){
			this.range = 3;
		}

		p.increaseMonitions = function(amount){
			this.monitions += amount;
		}

		p.decreaseMonitions = function(){
			this.monitions -=1;
		}

		p.drawShip =  function (position) {
			let sprite = new createjs.Sprite(bts.shipSpritesheet);
			sprite.regX = 55/2;
			sprite.regY = 110/2;

			sprite.x = position.x;
			sprite.y = position.y;
			sprite.position = getSectionByCoordinates(sprite.x, sprite.y);
			sprite.gotoAndPlay('ship');
			this.addChild(sprite);
			this.drawRangeMarker();

			bts.stage.addChild(this);
		}

		p.drawRangeMarker = function (){
			this.rangeSection = new createjs.Shape();

			this.rangeSection.graphics.beginFill('#4682B4').beginStroke('#4682B4').drawPolyStar(this.children[0].x, this.children[0].y, 50*(this.range + 2), 6, 0, 0);
			this.rangeSection.alpha = 0.2;
			this.rangeSection.name = 'range';

			bts.stage.addChild(this.rangeSection);

			this.markSectionsInRange();
		}

		bts.moveToNextPosition = function(ship, startPos, endPos){
			if(startPos.x != endPos.x || startPos.y != endPos.y){
				let newPos = {
					x: startPos.x,
					y: startPos.y
				};
				if(endPos.x == startPos.x){
					if(endPos.y > startPos.y){
						newPos.y += 87;
					}else{
						newPos.y -= 87;
					}
				}else if(endPos.x > startPos.x){
					newPos.x += 76;
					if(endPos.y > startPos.y){
						newPos.y += 44;
					}else{
						newPos.y -= 44;
					}
				}else{
					newPos.x -= 76;
					if(endPos.y > startPos.y){
						newPos.y += 44;
					}else{
						newPos.y -= 44;
					}
				}
				moveShip(ship, getSectionByCoordinates(newPos.x, newPos.y), endPos);
			}else{
				return;
			}
		}

		p.attackOponent = function(targetShip){
			if(this.monitions > 0 && targetShip.life > 0){
				targetShip.decreaseLife();
				this.decreaseMonitions();
			}
		}

		p.markSectionsInRange = function(){
			this.sectionsInRange = [];
			this.sectionsInRange = bts.sections.filter((section) => { 
				return bts.stage.getChildByName('range').hitTest(section.children[0].graphics.command.x, section.children[0].graphics.command.y);
			});
		}

		function moveShip(ship, target, endPos){
			let nextPos = {
				x: target.children[0].graphics.command.x,
				y: target.children[0].graphics.command.y
			}
			let hipotenuse = Math.sqrt(Math.pow(Math.abs(ship.children[0].x - nextPos.x),2) + Math.pow(Math.abs(ship.children[0].y - nextPos.y),2));
			let angle = calculateAngle({x: ship.children[0].x, y: ship.children[0].y}, nextPos, hipotenuse);
			createjs.Tween.get(ship.rangeSection.graphics.command)
				.to({x: nextPos.x, y: nextPos.y}, hipotenuse*10/ship.speed, createjs.Ease.sinIn)
				.call(ship.markSectionsInRange);
			createjs.Tween.get(ship.children[0])
		  	.to({rotation: angle}, (ship.children[0].rotation - angle)*10/ship.speed, createjs.Ease.sinIn)
		  	.to({ x: nextPos.x, y: nextPos.y}, hipotenuse*10/ship.speed, createjs.Ease.sinIn)
		  	.call(target.checkForPowerUp.bind(target), [ship])
		  	.call(bts.moveToNextPosition,[ship, nextPos, endPos]);
		}

		function getSectionByCoordinates(x, y){
			return bts.stage.getChildByName('field').children.find((section) => { return section.children[0].hitTest(x, y) == true });
		}

		function calculateAngle(startPoint, endPoint, hipotenuse){
			let angle= 0;
			let orientation;
			if(startPoint.x == endPoint.x){
				if(startPoint.y > endPoint.y) return 0; else	return 180;
			}else{
				let sin = Math.sin(Math.abs(startPoint.y - endPoint.y)/hipotenuse);
				angle = Math.asin(sin) * 180/Math.PI;
				if(startPoint.x > endPoint.x) orientation = -1; else orientation = 1;

				if(startPoint.y > endPoint.y){
					return -orientation*angle + orientation*90;
				}else if(startPoint.y < endPoint.y){
					return orientation*angle + orientation*90;
				}else{
					return orientation*90;
				}
			}
		}

		// add to namespace
		bts.Ship = Ship;	
	}())
}