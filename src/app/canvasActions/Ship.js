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
		let Ship = function (name, color,position, playerProps) {
			this.speed = playerProps.speed;
			this.monitions = playerProps.monitions;
			this.life = playerProps.life;
			this.range = playerProps.range;
			this.color = color;
			this.prevPos = [];

			this.initialize(name, position);
		}

		let p = Ship.prototype = new createjs.Container();
		p.Container_initialize = p.initialize;
		// :methods
		/**
		 * Initialize the section
		 *
		 * @method init
		 */
		p.initialize = function (name, position) {
			this.Container_initialize();
			this.drawShip(name, position);
		}

		/**
		 * Draws ship on map
		 *
		 * @method drawShip
		 * @param {String}  name The name of the ship/player
		 * @param {Object} position x and y coordinates
		 */
		p.drawShip =  function (name, position) {
			this.explosion = new createjs.Sprite(bts.explosionSpriteSheet);
			this.explosion.alpha = 0;
			bts.stage.addChild(this.explosion);
			let sprite = new createjs.Sprite(bts.shipSpritesheet);
			sprite.regX = 55/2;
			sprite.regY = 110/2;

			sprite.x = this.explosion.x = position.x;
			sprite.y = this.explosion.y = position.y;
			this.position = bts.getSectionByCoordinates(sprite.x, sprite.y);
			sprite.gotoAndPlay('ship');
			this.addChild(sprite);
			let stats= new createjs.Container();

			stats.x = position.x - 50;
			stats.y = position.y - 120;
			this.name = name;
			this.drawStats(stats);
			bts.stage.getChildByName('ships').addChild(this);
		}

		/**
		 * Draws the shape marking the range of the ship
		 *
		 * @method drawRangeMarker
		 */
		p.drawRangeMarker = function (){
			bts.stage.removeChild(bts.stage.getChildByName('range'));

			this.rangeSection = new createjs.Shape();

			this.rangeSection.graphics.beginFill('#4682B4').beginStroke('#4682B4').drawPolyStar(this.children[0].x, this.children[0].y, 50*(this.range + 2), 6, 0, 0);
			this.rangeSection.alpha = 0.2;
			this.rangeSection.name = 'range';

			bts.stage.addChild(this.rangeSection);

			this.markSectionsInRange();
		}

		/**
		 * Draws the info bubble of the ship
		 *
		 * @method drawStats
		 * @param {createjs.Container} stats Container for the text and the number of lifes indicator
		 */
		p.drawStats = function(stats){
			let background = new createjs.Shape();

			let text = new createjs.Text(this.name, "20px monospace", this.color);

			let life = new createjs.Container();
			life.x = text.getMeasuredWidth() + 10;
			life.name = 'life';

			this.drawLife(life);

			background.graphics.beginFill('#F7F8F9').drawRoundRect(-10, -10, life.x + this.life*15 + 20, 40, 10);

			stats.addChild(background, text, life);
			stats.name = 'stats';

			this.addChild(stats);
		}

		/**
		 * Draws the number of lifes indicator
		 *
		 * @method drawLife
		 * @param {createjs.Container} life Container for the number of lifes indicator
		 */
		p.drawLife = function(life){
			life.children = [];
			for(let i = 0; i< this.life; i+=1){
				let lifeLine = new createjs.Shape();
				lifeLine.graphics.beginFill(this.color).drawRoundRect(i*15, 0, 10, 20, 5);	
				life.addChild(lifeLine);		
			}
		}

		/**
		 * Positions the explosion Srite in the middle of the ship and plays animation
		 *
		 * @method explodingAnimation
		 */
		p.explodingAnimation = function(){
			this.explosion.x = this.position.children[0].graphics.command.x - 32;
			this.explosion.y = this.position.children[0].graphics.command.y - 32;
			this.explosion.alpha = 1;
			this.explosion.gotoAndPlay('explode');
		}

		/**
		 * Gets the firts posible for movement position that is a neibor to both given sections
		 *
		 * @method getClosestPosiblePosition
		 * @param {Section} startSection The position ship is in
		 * @param {Sectin} nextSection The position to move the ship
		 */
		p.getClosestPosiblePosition = function(startSection, nextSection){
			let startPosNeighbors = startSection.getNeighbors();
			let nextPosNeighbors = nextSection.getNeighbors();
			let mutualNeighbors = [];

			startPosNeighbors.forEach(neighbor =>{
				let mutual = nextPosNeighbors.find(section => {
					return section.id == neighbor.id && !this.isInPerviosPositions(section);
				});
				if(mutual){
					mutualNeighbors.push(mutual);
				}
			});

			if(mutualNeighbors.length == 0){
				let next = startPosNeighbors.filter(section => {
					return !this.isInPerviosPositions(section);
				});
				if(next.length > 0){
					return next[next.length - 1];
				}else{
					return this.prevPos.pop();
				}
			}
			return mutualNeighbors[mutualNeighbors.length -1];
		}

		/**
		 * Calculates the next position to move the ship to
		 *
		 * @method moveToNextPosition
		 * @param {Ship} ship The position ship is in
		 * @param {Object} startPos The position ship is in
		 * @param {Object} endPos The position to move the ship
		 */
		bts.moveToNextPosition = function(ship, startPos, endPos){
			if(ship.position.mine == true && this.name == bts.me){
				ship.position.mine = false;
				ship.explodingAnimation();
				window.socket.emit('steped on mine', bts.me);
				return;
			}

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
				let next = bts.getSectionByCoordinates(newPos.x, newPos.y);
				if(!next){
					next = bts.getSectionByCoordinates(startPos.x, startPos.y).getNeighbors()[0];
				}
				if(next.occupied == true){
					next = ship.getClosestPosiblePosition(bts.getSectionByCoordinates(startPos.x, startPos.y), next);
					if(ship.isInPerviosPositions(next)){
						next = ship.getClosestPosiblePosition(bts.getSectionByCoordinates(startPos.x, startPos.y), next);
					}
				}else{
					if(ship.isInPerviosPositions(next)){
						next = ship.getClosestPosiblePosition(bts.getSectionByCoordinates(startPos.x, startPos.y), next);
					}else{

					}
				}
				ship.prevPos.push(bts.getSectionByCoordinates(startPos.x, startPos.y));
				moveShip(ship, next, endPos);
				ship.position = next;
				if(ship.sectionsInRange){
					ship.markSectionsInRange();
				}
			}else{
				ship.position = bts.getSectionByCoordinates(startPos.x, startPos.y);
				if(ship.name != bts.me){
					ship.alpha = ship.position.alpha;
				}
				if(ship.sectionsInRange){
					ship.markSectionsInRange();
				}
				return;
			}
		}

		/**
		 * Gets the firts posible for movement position that is a neibor to both given sections
		 *
		 * @method isInPerviosPositions
		 * @param {Section} section 
		 */
		p.isInPerviosPositions = function(section){
			return !!this.prevPos.find(previous =>{
				return previous.id == section.id;
			});
		}

		/**
		 * Emits socket event for attack with the target name
		 *
		 * @method attackOponent
		 * @param {Ship} targetShip 
		 */
		p.attackOponent = function(targetShip){
			if(targetShip){
				if(bts.myship.monitions > 0 && targetShip.life > 0){
					window.socket.emit('hit', {name: targetShip.name});
				}
			}
		}

		/**
		 * Sets the sections that intersect with range shape of the ship and reveals them if not visible
		 *
		 * @method markSectionsInRange
		 */
		p.markSectionsInRange = function(){
			this.sectionsInRange = [];
			this.sectionsInRange = bts.sections.filter((section) => { 
				return bts.stage.getChildByName('range').hitTest(section.children[0].graphics.command.x, section.children[0].graphics.command.y);
			});
			
			bts.sandBorder.forEach((sand) => { 
				if(bts.stage.getChildByName('range').hitTest(sand.graphics.command.x, sand.graphics.command.y)){
					createjs.Tween.get(sand).to({alpha: 1}, 100, createjs.Ease.sinIn)
				}
			});

			this.sectionsInRange.forEach(section=>{
				if(section.getTargetShip()){
					section.getTargetShip().alpha = 1;
				}
				createjs.Tween.get(section).to({alpha: 1}, 10/this.speed, createjs.Ease.sinIn)
				if(section.island){
					createjs.Tween.get(section.island).to({alpha: 1}, 10/this.speed, createjs.Ease.sinIn)
		  	}
			})
		}

		/**
		 * Gets a section by given coordinates
		 *
		 * @method getSectionByCoordinates
		 * @param {Number} x 
		 * @param {Number} y 
		 */
		bts.getSectionByCoordinates = function(x, y){
			return bts.stage.getChildByName('field').children.find((section) => {
			 return section.children[0].hitTest(x, y) == true 
			});
		}

		/**
		 * Calculates ships rotaion angle
		 *
		 * @method calculateAngle
		 * @param {Object} startPoint 
		 * @param {Object} endPoint 
		 * @param {Number} hipotenuse  
		 */
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

		/**
		 * Handles the movement animations
		 *
		 * @method moveShip
		 * @param {Ship} ship The ship to be moved
		 * @param {Section} target  
		 * @param {Object} the last position the ship should move to 
		 */
		function moveShip(ship, target, endPos){
			let nextPos = {
				x: target.children[0].graphics.command.x,
				y: target.children[0].graphics.command.y
			}

			let hipotenuse = Math.sqrt(Math.pow(Math.abs(ship.children[0].x - nextPos.x),2) + Math.pow(Math.abs(ship.children[0].y - nextPos.y),2));
			let angle = calculateAngle({x: ship.children[0].x, y: ship.children[0].y}, nextPos, hipotenuse);

			if(ship.rangeSection){
				createjs.Tween.removeTweens(ship.rangeSection.graphics.command);
				createjs.Tween.get(ship.rangeSection.graphics.command)
					.to({x: nextPos.x, y: nextPos.y}, hipotenuse*10/ship.speed, createjs.Ease.sinIn);
			}

			createjs.Tween.removeTweens(ship.children[0], ship.children[1]);
			createjs.Tween.get(ship.children[0])
		  	.to({rotation: angle}, 100, createjs.Ease.sinIn)
		  	.to({ x: nextPos.x, y: nextPos.y}, hipotenuse*10/ship.speed, createjs.Ease.sinIn)
		  	.call(target.checkForPowerUp.bind(target), [ship])
		  	.call(bts.moveToNextPosition,[ship, nextPos, endPos]);

		  createjs.Tween.get(ship.children[1])
		  	.to({ x: nextPos.x - 50, y: nextPos.y - 100}, hipotenuse*10/ship.speed, createjs.Ease.sinIn);
		}

		// add to namespace
		bts.Ship = Ship;	
	}())
}