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

		p.drawRangeMarker = function (){
			bts.stage.removeChild(bts.stage.getChildByName('range'));

			this.rangeSection = new createjs.Shape();

			this.rangeSection.graphics.beginFill('#4682B4').beginStroke('#4682B4').drawPolyStar(this.children[0].x, this.children[0].y, 50*(this.range + 2), 6, 0, 0);
			this.rangeSection.alpha = 0.2;
			this.rangeSection.name = 'range';

			bts.stage.addChild(this.rangeSection);

			this.markSectionsInRange();
		}

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

		p.drawLife = function(life){
			life.children = [];
			for(let i = 0; i< this.life; i+=1){
				let lifeLine = new createjs.Shape();
				lifeLine.graphics.beginFill(this.color).drawRoundRect(i*15, 0, 10, 20, 5);	
				life.addChild(lifeLine);		
			}
		}

		p.explodingAnimation = function(){
			this.explosion.x = this.position.children[0].graphics.command.x - 32;
			this.explosion.y = this.position.children[0].graphics.command.y - 32;
			this.explosion.alpha = 1;
			this.explosion.gotoAndPlay('explode');
		}

		bts.getNeighbors = function(section){
			let neighbors = [];
			let sectionPos = section.children[0].graphics.command;

			neighbors.push(bts.getSectionByCoordinates(sectionPos.x, sectionPos.y - 87));
			neighbors.push(bts.getSectionByCoordinates(sectionPos.x, sectionPos.y + 87));
			neighbors.push(bts.getSectionByCoordinates(sectionPos.x - 76, sectionPos.y - 44));
			neighbors.push(bts.getSectionByCoordinates(sectionPos.x - 76, sectionPos.y + 44));
			neighbors.push(bts.getSectionByCoordinates(sectionPos.x + 76, sectionPos.y - 44));
			neighbors.push(bts.getSectionByCoordinates(sectionPos.x + 76, sectionPos.y + 44));

			return neighbors.filter(section =>{
				return section && section instanceof bts.Section && section.occupied != true;
			});
		}

		bts.getClosestPosiblePosition = function(ship, startPos, nextPos){
			let startPosNeighbors = bts.getNeighbors(startPos);
			let nextPosNeighbors = bts.getNeighbors(nextPos);
			let mutualNeighbors = [];

			startPosNeighbors.forEach(neighbor =>{
				let mutual = nextPosNeighbors.find(section => {
					return section.id == neighbor.id && !ship.isInPerviosPositions(section);
				});
				if(mutual){
					mutualNeighbors.push(mutual);
				}
			});

			if(mutualNeighbors.length == 0){
				let next = startPosNeighbors.filter(section => {
					return !ship.isInPerviosPositions(section);
				});
				if(next.length > 0){
					return next[next.length - 1];
				}else{
					return ship.prevPos.pop();
				}
			}
			return mutualNeighbors[mutualNeighbors.length -1];
		}

		bts.moveToNextPosition = function(ship, startPos, endPos){
			if(ship.position.mine == true && ship.name == bts.me){
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
				if(next.occupied == true){
					next = bts.getClosestPosiblePosition(ship, bts.getSectionByCoordinates(startPos.x, startPos.y), next);
					if(ship.isInPerviosPositions(next)){
						next = bts.getClosestPosiblePosition(ship, bts.getSectionByCoordinates(startPos.x, startPos.y), next);
					}
				}else{
					if(ship.isInPerviosPositions(next)){
						next = bts.getClosestPosiblePosition(ship, bts.getSectionByCoordinates(startPos.x, startPos.y), next);
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

		p.isInPerviosPositions = function(next){
			return !!this.prevPos.find(previous =>{
				return previous.id == next.id;
			});
		}

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

		p.attackOponent = function(targetShip){
			if(targetShip){
				if(bts.myship.monitions > 0 && targetShip.life > 0){
					window.socket.emit('hit', {name: targetShip.name, x:  targetShip.position.children[0].graphics.command.x, y:  targetShip.position.children[0].graphics.command.y});
				}
			}
		}

		p.markSectionsInRange = function(){
			this.sectionsInRange = [];
			this.sectionsInRange = bts.sections.filter((section) => { 
				return bts.stage.getChildByName('range').hitTest(section.children[0].graphics.command.x, section.children[0].graphics.command.y);
			});

			this.sectionsInRange.forEach(section=>{
				if(section.getTargetShip()){
					section.getTargetShip().alpha = 1;
				}
				createjs.Tween.get(section)
			  	.to({alpha: 1}, 10/this.speed, createjs.Ease.sinIn)
				if(section.island){
					createjs.Tween.get(section.island)
			  		.to({alpha: 1}, 10/this.speed, createjs.Ease.sinIn)
		  	}
			})
		}

		bts.getSectionByCoordinates = function(x, y){
			return bts.stage.getChildByName('field').children.find((section) => {
			 return section.children[0].hitTest(x, y) == true 
			});
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