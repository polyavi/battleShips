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
		let Section = function (row, line) {
			// :properties
			this.row = row;
			this.line = line;

			this.initialize();
		}

		let p = Section.prototype = new createjs.Container();
		p.Container_initialize = p.initialize;
		// :methods
		/**
		 * Initialize the section
		 *
		 * @method init
		 */
		p.initialize = function () {
			this.Container_initialize();
			this.drawSection('#fff');
		}
	 
		p.drawSection= function (fillColor){
			let section = new createjs.Shape();

			section.graphics
				.beginStroke('#000')
				.beginFill(fillColor)
				.drawRect(
					bts.SCORE_BOARD_WIDTH + this.row*bts.SECTION_SIZE, 
					this.line*bts.SECTION_SIZE, bts.SECTION_SIZE, bts.SECTION_SIZE
				);
			section.alpha = 0.4;
			this.occupied = false;
			this.name = this.line + '-' + this.row;

			this.addChild(section);
		}

		p.addEventListeners = function(){
			this.cursor = 'pointer';
			this.on('click', this.onSectionClick);
		}

		p.onSectionClick = function(){
			if(this.checkIfSectionInOponentField()){
				this.reveal();
				this.removeAllEventListeners();
				this.cursor = 'default';

				bts.socket.emit('hit', { row: this.row - 6, line: this.line});
				if(!bts.finishGame){
					bts.showMessage("Oponent's turn");
				}
			}
		}

		p.checkIfSectionInOponentField = function(){
			if(this.row >= 6 && this.row < 12){
				return true;
			}
			else false;
		}

		p.reveal = function(){
			if(this.children[0].occupied == true){
				this.explode();
				this.removeFromShipsOccupiedSections();
				this.drawSection('#db2323');
			}else{
				this.drawSection('#333');
			}
		}

		p.explode = function () {
			let explosionSpritesheet = new createjs.SpriteSheet(
			{
				images : [bts.queue.getResult('explosion')],
				frames: bts.explosionSpritesheetData.frames,
				animations: bts.explosionSpritesheetData.animations
			});

			let explosion = new createjs.Sprite(explosionSpritesheet, 'explode');

			explosion.x = this.children[0].graphics.command.x;
			explosion.y = this.children[0].graphics.command.y;
			explosion.on("animationend", function(e){
				bts.stage.removeChild(e);
				console.log('explosion removed');
			});

			bts.stage.addChild(explosion);
		}

		p.removeFromShipsOccupiedSections =  function (){
			bts.stage.children.find(element => {
				if(element instanceof bts.Ship && !element.sunk){
					let foundSection = element.occupiedSections.find(section => {
						if(section.row == this.row && section.line == this.line){
							return true;
						}
						return false;
					});
					if(foundSection){
						element.occupiedSections = element.occupiedSections.filter(section => {
							if(section.row == this.row && section.line == this.line){
								return false;
							}
							return true;
						});
						if(element.occupiedSections.length == 0 && !element.sunk){
							bts.decreasePlayerShips(this);
							element.revealShip();
						}
					}
					
				}
			});
		}

		/**
		 * Get section by given row and line.
		 *
		 * @method getSectionByPosition
		 * @param {Number} row 
		 * @param {Number} line 
		 * @return {Section} 
		 */
		bts.getSectionByPosition = function(row,line){
			return  bts.stage.getChildByName('field').children[line*bts.ROWS + row];
		}

		bts.getAllOccupiedSections = function () {
			let field = bts.stage.getChildByName('field');
			let occupiedSections = [];

			occupiedSections = field.children.filter( section => section.children[0].occupied == true);

			return occupiedSections;
		}

		/**
		 * Checks if the position is free for the ship to be placed in
		 * 
		 * @method isPositionOccupied
		 * @param {Object} position 
		 * @return {Boolean} 
		 */
		bts.isPositionOccupied = function (position){
			let occupiedInPos, allOccupied = bts.getAllOccupiedSections();
			occupiedInPos = allOccupied.filter(function(section){
				if(section.line >= position.line && section.line < position.line + position.occupiedLines){
					if(section.row >= position.row && section.row < position.row + position.occupiedRows){
						return true;
					}
				}
				return false;
			});

			if(occupiedInPos.length == 0){ 
				return false;
			}
			return true;
		}

		// add to namespace
		bts.Section = Section;
	}())
}