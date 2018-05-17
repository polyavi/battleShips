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
			let sprite = new createjs.Sprite(bts.shipSpritesheet);
			sprite.regX = 55/2;
			sprite.regY = 110/2;

			sprite.x = position.x;
			sprite.y = position.y;
			this.position = getSectionByCoordinates(sprite.x, sprite.y);
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

			let text = new createjs.Text(this.name, "40px monospace", this.color);

			let life = new createjs.Container();
			life.x = text.getMeasuredWidth() + 10;
			life.name = 'life';

			this.drawLife(life);

			background.graphics.beginFill('#F7F8F9').drawRoundRect(-10, -10, life.x + this.life*15 + 20, 60, 10);

			stats.addChild(background, text, life);
			stats.name = 'stats';

			this.addChild(stats);
		}

		p.drawLife = function(life){
			life.children = [];
			for(let i = 0; i< this.life; i+=1){
				let lifeLine = new createjs.Shape();
				lifeLine.graphics.beginFill(this.color).drawRoundRect(i*15, 5, 10, 30, 5);	
				life.addChild(lifeLine);		
			}
		}

		function getNeighbors(section){
			let neighbors = [];
			let sectionPos = section.children[0].graphics.command;
			neighbors.push(getSectionByCoordinates(sectionPos.x, sectionPos.y - 87));
			neighbors.push(getSectionByCoordinates(sectionPos.x, sectionPos.y + 87));
			neighbors.push(getSectionByCoordinates(sectionPos.x - 76, sectionPos.y - 44));
			neighbors.push(getSectionByCoordinates(sectionPos.x - 76, sectionPos.y + 44));
			neighbors.push(getSectionByCoordinates(sectionPos.x + 76, sectionPos.y - 44));
			neighbors.push(getSectionByCoordinates(sectionPos.x + 76, sectionPos.y + 44));

			return neighbors.filter(section =>{
				return section.occupied != true;
			});
		}

		function getClosestPosiblePosition(startPos, nextPos){
			let startPosNeighbors = getNeighbors(startPos);
			let nextPosNeighbors = getNeighbors(nextPos);
			let mutualNeighbors = [];
			startPosNeighbors.forEach(neighbor =>{
				mutualNeighbors.push(nextPosNeighbors.find(section => {
					return section.id == neighbor.id;
				}))
			});
			return mutualNeighbors.filter(section =>{
				return !!section
			});
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
				if(getSectionByCoordinates(newPos.x, newPos.y).occupied == true){
					let next = getClosestPosiblePosition(getSectionByCoordinates(startPos.x, startPos.y), getSectionByCoordinates(newPos.x, newPos.y))[0];
					moveShip(ship, next, endPos);
				}else{
					moveShip(ship, getSectionByCoordinates(newPos.x, newPos.y), endPos);

				}
			}else{
				ship.position = getSectionByCoordinates(startPos.x, startPos.y);
				if(ship.sectionsInRange){
					ship.markSectionsInRange();
				}
				return;
			}
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
		  	.to({rotation: angle}, (ship.children[0].rotation - angle)*10/ship.speed, createjs.Ease.sinIn)
		  	.to({ x: nextPos.x, y: nextPos.y}, hipotenuse*10/ship.speed, createjs.Ease.sinIn)
		  	.call(target.checkForPowerUp.bind(target), [ship])
		  	.call(bts.moveToNextPosition,[ship, nextPos, endPos]);

		  createjs.Tween.get(ship.children[1])
		  	.to({ x: nextPos.x - 50, y: nextPos.y - 100}, hipotenuse*10/ship.speed, createjs.Ease.sinIn)
		}

		p.attackOponent = function(targetShip){
			if(this.monitions > 0 && targetShip.life > 0){
				window.socket.emit('hit', targetShip.name);
			}
		}

		p.markSectionsInRange = function(){
			this.sectionsInRange = [];
			this.sectionsInRange = bts.sections.filter((section) => { 
				return bts.stage.getChildByName('range').hitTest(section.children[0].graphics.command.x, section.children[0].graphics.command.y);
			});
		}

		function getSectionByCoordinates(x, y){
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