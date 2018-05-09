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
			//draw center of field
			let sectionCenter = new bts.Section(this.center);
			bts.sections.push(sectionCenter);
			// draw center line
			p.drawLineOfSections(this.center, this.size, 87);
			p.drawLineOfSections(this.center, this.size, -87);
			
			// rest of the field
			for(let i = this.size; i > this.size/2; i-=1){
				let j = this.size - i +1;
				for(let k = 1; k<3; k+=1){
					let d = Math.pow(-1, k);

					p.drawLineOfSections({x: this.center.x + 152*j*d, y: this.center.y - 87}, i, 87);
					p.drawLineOfSections({x: this.center.x + 152*j*d, y: this.center.y}, i-1, -87);

					p.drawLineOfSections({x: this.center.x + (76 + 152*(j-1))*d, y: this.center.y - 44}, i, 87);
					p.drawLineOfSections({x: this.center.x + (76 + 152*(j-1))*d, y: this.center.y + 44}, i, -87);
				}
			}

			this.addChild(...bts.sections);
			this.name = 'field';
			this.setPowerUpsInField();

			bts.stage.addChild(this);
		}

		p.drawLineOfSections = function(startingPoint, numberofSections, step){
			for(let i = 1; i < numberofSections + 1; i+=1){
				let section = new bts.Section({x: startingPoint.x, y: startingPoint.y + step*i});
				bts.sections.push(section);
			}
		}

		p.setPowerUpsInField = function(){
			let count = bts.powerUps.length*this.size;
			let length = this.children.length;
			for(count; count > 0; count -=1){
				let section = this.children[Math.floor(Math.random()*length)];
				section.alpha = 0.5;
				section.powerup = bts.powerUps[Math.ceil(count/this.size) - 1];
			}
		}

		bts.Field = Field;
	}())
}