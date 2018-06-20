/**
 * @module BattleShips
 */
export default (Data)=>{
  window.bts = window.bts || {};

	(function () {
		'use strict';

		let stage = Data.stage;
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
		};

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
		};

		/**
		 * Draws ship on map
		 *
		 * @method drawShip
		 * @param {String}  name The name of the ship/player
		 * @param {Object} position x and y coordinates
		 */
		p.drawShip =  function (name, position) {
			this.explosion = new createjs.Sprite(Data.explosionSpriteSheet);
			this.explosion.alpha = 0;
			stage.addChild(this.explosion);

			let sprite = new createjs.Sprite(Data.shipSpritesheet);
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
			stage.getChildByName('ships').addChild(this);
		};

		/**
		 * Draws the shape marking the range of the ship
		 *
		 * @method drawRangeMarker
		 */
		p.drawRangeMarker = function (){
			stage.removeChild(stage.getChildByName('range'));

			this.rangeSection = new createjs.Shape();

			this.rangeSection.graphics.beginFill('#4682B4').beginStroke('#4682B4').drawPolyStar(this.children[0].x, this.children[0].y, 50*(this.range + 2), 6, 0, 0);
			this.rangeSection.alpha = 0.2;
			this.rangeSection.name = 'range';

			stage.addChild(this.rangeSection);

			this.markSectionsInRange();
		};

		/**
		 * Draws the info bubble of the ship
		 *
		 * @method drawStats
		 * @param {createjs.Container} stats Container for the text and the number of lifes indicator
		 */
		p.drawStats = function(stats){
			stats.removeAllChildren();
			let background = new createjs.Shape();

			let text = new createjs.Text(this.name, '20px monospace', this.color);

			let life = new createjs.Container();
			life.x = text.getMeasuredWidth() + 10;
			life.name = 'life';

			this.drawLife(life);

			background.graphics.beginFill('#F7F8F9').drawRoundRect(-10, -10, life.x + this.life*15 + 20, 40, 10);

			stats.addChild(background, text, life);
			stats.name = 'stats';

			this.addChild(stats);
		};

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
		};

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
		};

		/**
		 * Calculates the next position to move the ship to
		 *
		 * @method getNextSection
		 * @param {Section} startSection The section ship is in
		 * @param {Section} endSection The section to move the ship
		 * @returns {Section} the next section to move the ship to
		 */

		bts.getNextSection = function(startSection, endSection){
			let closest = {};
			if(!startSection.neighbors.find(neighbor => neighbor.id == endSection.id)){
				let distances = [];

				startSection.neighbors.forEach( (neighbor, index) =>{
					distances.push(bts.getDistanceBetweenSections(neighbor, endSection));
				});

				closest = distances[0];
				for(let i = 1; i < distances.length; i+=1){
					if(distances[i].distance < closest.distance){
						closest = distances[i];
					}
				}
			}else{
				closest.section = startSection.neighbors.find(neighbor => {
					return neighbor.id == endSection.id;
				});
			}						
			return closest.section;
		};

		/**
		 * Intiates all actions connected to ship movent to next section
		 *
		 * @method moveToNextPosition
		 * @param {Ship} ship The position ship is in
		 * @param {Object} startPos The position ship is in
		 * @param {Object} endPos The position to move the ship
		 */
		bts.moveToNextPosition = function(ship, startPos, endPos){
			if(ship.position.mine == true && ship.name == Data.me){
				ship.position.mine = false;
				ship.explodingAnimation();
				window.socket.emit('steped on mine', Data.me);
				return;
			}

			let startSection = bts.getSectionByCoordinates(startPos.x, startPos.y);
			let endSection = bts.getSectionByCoordinates(endPos.x, endPos.y);

			if(startSection.id != endSection.id){
				let nextSection = bts.getNextSection(startSection, endSection);
				ship.position = nextSection;

				if(ship.sectionsInRange){
					ship.markSectionsInRange();
				}

				moveShip(ship, nextSection, endPos);
			}else{
				ship.position = startSection;
				if(ship.name != Data.me){
					ship.alpha = ship.position.alpha;
				}
				if(ship.sectionsInRange){
					ship.markSectionsInRange();
				}
				return;
			}
		};

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
		};

		/**
		 * Emits socket event for attack with the target name
		 *
		 * @method attackOponent
		 * @param {Ship} targetShip 
		 */
		p.attackOponent = function(targetShip){
			if(targetShip){
				if(Data.myship.monitions > 0 && targetShip.life > 0){
					window.socket.emit('hit', {name: targetShip.name});
				}
			}
		};

		/**
		 * Sets the sections that intersect with range shape of the ship and reveals them if not visible
		 *
		 * @method markSectionsInRange
		 */
		p.markSectionsInRange = function(){
			this.sectionsInRange = [];
			this.sectionsInRange = Data.sections.filter((section) => {
				return stage.getChildByName('range').hitTest(section.children[0].graphics.command.x, section.children[0].graphics.command.y);
			});
			
			Data.sandBorder.forEach((sand) => { 
				if(stage.getChildByName('range').hitTest(sand.graphics.command.x, sand.graphics.command.y)){
					createjs.Tween.get(sand).to({alpha: 1}, 100/this.speed, createjs.Ease.sinIn);
				}
			});

			this.sectionsInRange.forEach(section=>{
				if(section.getTargetShip()){
					section.getTargetShip().alpha = 1;
				}
				createjs.Tween.get(section).to({alpha: 1}, 100/this.speed, createjs.Ease.sinIn);
			});
		};

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
			};

			let hipotenuse = Math.sqrt(Math.pow(Math.abs(ship.children[0].x - nextPos.x),2) + Math.pow(Math.abs(ship.children[0].y - nextPos.y),2));
			let angle = calculateAngle({x: ship.children[0].x, y: ship.children[0].y}, nextPos, hipotenuse);

			if(ship.rangeSection){
				createjs.Tween.removeTweens(ship.rangeSection.graphics.command);
				createjs.Tween.get(ship.rangeSection.graphics.command)
					.to({x: nextPos.x, y: nextPos.y}, hipotenuse*10/ship.speed, createjs.Ease.sinIn);
			}

			createjs.Tween.removeTweens(ship.children[0], ship.children[1]);
			createjs.Tween.get(ship.children[0])
		  	.to({rotation: angle}, 10, createjs.Ease.sinIn)
		  	.to({ x: nextPos.x, y: nextPos.y}, hipotenuse*10/ship.speed, createjs.Ease.sinIn)
		  	.call(target.checkForPowerUp.bind(target), [ship])
		  	.call(bts.moveToNextPosition,[ship, nextPos, endPos]);

		  createjs.Tween.get(ship.children[1])
		  	.to({ x: nextPos.x - 50, y: nextPos.y - 100}, hipotenuse*10/ship.speed, createjs.Ease.sinIn);
		}

		// add to namespace
		bts.Ship = Ship;	
	}());
};