/**
 * @module BattleShips
 */
export default ()=>{
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

			this.center = {
				x: bts.stage.canvas.clientWidth/2,
				y: bts.stage.canvas.clientHeight/2
			}		
			this.size = bts.fieldSize;

			this.initialize();
		}

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
		}
	 
		p.drawField = function (){
			let i = 0;
			for(let j=0; j < this.size*2 + 2; j+=1){
				drawSand(-76, -44 + 87*j);
			}
			while(i < this.size*3/2){
				p.drawLineOfSections({x: 152*i, y: 0}, this.size*2, 87, i);
				p.drawLineOfSections({x: 76 + 152*i, y: 44}, this.size*2, 87, i +	1);
				i+=1;
			}
			for(let j=0; j < this.size*2 + 2; j+=1){
				drawSand(152*this.size*3/2+1, 87*(j-1));
			}
			this.addChild(...bts.sections);
			this.name = 'field';

			bts.stage.addChild(this);
		}
		
		function drawSand(x, y){
			let sand = new createjs.Shape();
			sand.graphics.beginBitmapFill(bts.sand).beginStroke('#E4B363').drawPolyStar(x, y, 50, 6, 0, 0);
			sand.alpha = 0;
			bts.sandBorder.push(sand);
		}

		p.drawLineOfSections = function(startingPoint, numberofSections, step, numberOfRow){
			drawSand(startingPoint.x, startingPoint.y - step);
			drawSand(startingPoint.x, startingPoint.y + step*numberofSections);

			for(let i = 0; i < numberofSections; i+=1){
				let section = new bts.Section({x: startingPoint.x, y: startingPoint.y + step*i});
				section.name = numberOfRow + '-' + i;
				bts.sections.push(section);
				section.alpha = 0;
			}
		}

		p.setPowerUpsInField = function(powerups){
			let length = powerups.length;
			for(let i = 0; i < length; i+=1){
				let section = this.children[powerups[i].section];
				section.addPowerUp(powerups[i]);
			}
		}

		p.setMines = function(mines){
			let length = mines.length;
			for(let i = 0; i < length; i+=1){
				let section = this.children[mines[i]];
				section.mine = true;
			}
		}

		p.drawIsland = function(position){
			let island = new createjs.Container();
			let bitmap = new createjs.Bitmap(bts.island);
			bitmap.scaleX = bitmap.scaleY = 0.1;

			bitmap.x = position.x - bitmap.image.naturalWidth*0.1/2;
			bitmap.y = position.y - bitmap.image.naturalHeight*0.1/2;

			island.addChild(bitmap);
			island.name = 'island';
			bitmap.alpha = 0;

			this.addChild(island);
			setSectionsInsideIsland(bitmap);
		}

		function setSectionsInsideIsland(bitmap){
			bts.sections.forEach((section) => { 
				if(bitmap.x < section.children[0].graphics.command.x && section.children[0].graphics.command.x < bitmap.x + bitmap.image.naturalWidth*0.1 && bitmap.y < section.children[0].graphics.command.y && section.children[0].graphics.command.y < bitmap.y + bitmap.image.naturalHeight*0.1){
					section.occupied = true;
					section.island = bitmap;
				}
			});
		}

		bts.Field = Field;
	}())
}