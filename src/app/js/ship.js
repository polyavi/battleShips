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
		let Ship = function (data) {
			this.orientation = 1;
			this.states = {
				initial: data.name,
				hit: 'hit' + data.name.charAt(0).toUpperCase() + data.name.substring(1)
			}
			this.occupiedSections = [];
			this.size = data.size;

			this.initialize(data);
		}

		let p = Ship.prototype = new createjs.Container();
		p.Container_initialize = p.initialize;
		// :methods
		/**
		 * Initialize the ship
		 *
		 * @method init
		 */
		p.initialize = function (data) {
			this.Container_initialize();
			this.drawShip(data);
		}

		p.drawShip =  function (data) {
			let sprite = new createjs.Sprite(bts.shipSpritesheet);
			sprite.gotoAndStop(data.name);

			let width = bts.shipsSpritesheetData.frames[bts.shipsSpritesheetData.animations[data.name][0]][2];
			let height = bts.shipsSpritesheetData.frames[bts.shipsSpritesheetData.animations[data.name][0]][3];

			this.scaledWidth = width*data.scale;
			this.scaledHeight = height*data.scale;

			sprite.name = data.name;
			sprite.x = data.x;
			sprite.y = data.y;
			sprite.scaleX = sprite.scaleY = data.scale;

			this.addEventListener("click", this.placeOnField);

			this.addChild(sprite);
		}

		/**
		 * Add Drag and Rotate event listeners 
		 *
		 * @method addDragAndRotateEvents
		 * @param {Object} Start to move ship event
		 */
		p.addDragAndRotateEvents = function (e){
			let sprite = e.target;
			let ship = sprite.parent;

			let mousePosInShip = {
				x: sprite.x - bts.stage.mouseX,
				y: sprite.y - bts.stage.mouseY,
			}

			ship.currPos = ship.setPostion({x: sprite.x, y: sprite.y});
			ship.freeOccupiedSections(ship.currPos);

			bts.stage.addEventListener('stagemousemove', function(e){
				ship.nextPos = ship.setPostion({x: bts.stage.mouseX + mousePosInShip.x, y: bts.stage.mouseY + mousePosInShip.y});
				ship.moveShip();
			});

			bts.stage.addEventListener('stagemouseup', function (e) {
				bts.stage.removeAllEventListeners();

				if(ship.currPos.x == sprite.x && ship.currPos.y == sprite.y){
					ship.currPos.orientation = ship.orientation;
					ship.rotateShip();
				}

				ship.nextPos = ship.setPostion({x: bts.stage.mouseX + mousePosInShip.x, y: bts.stage.mouseY + mousePosInShip.y});
				ship.positionShip();	
			});
		}

		/**
		 * Initial placement of the ship on field 
		 *
		 * @method placeOnField
		 * @param {Object} Click on ship event
		 */
		p.placeOnField = function (e){
			let sprite = e.target;
			let ship = sprite.parent;
			ship.nextPos = ship.setPostion({
				x : bts.SCORE_BOARD_WIDTH,
				y : 0
			});

			if(!bts.isPositionOccupied(ship.nextPos)){
				ship.removeAllEventListeners();
				ship.addEventListener("mousedown", ship.addDragAndRotateEvents);
				ship.positionShip();	
			}	
		}

		p.moveShip = function () {
			let sprite = this.children[0];

			if(this.isShipInPlayerField()){
				sprite.x = this.nextPos.x;
				sprite.y = this.nextPos.y;
			}
		}

		p.rotateShip = function(){
			let sprite = this.children[0];

			this.orientation = -1*this.orientation;
			sprite.rotation = sprite.rotation + 90*this.orientation;
		}

		p.revealShip = function(){
			this.visible = true;
			this.children[0].gotoAndStop(this.states.hit);
			this.sunk = true;
		}

		/**
		 * Checks if ship is inside field bounderies 
		 * according to the orientation of the ship
		 * 
		 * @method isShipInPlayerField
		 * @return {Boolean} 
		 */
		p.isShipInPlayerField = function(){
			let leftBorder, rightBorder, topBorder, bottomBorder;
			leftBorder = bts.SCORE_BOARD_WIDTH;

			if(this.orientation > 0){
				rightBorder = bts.FIELD_SEPARATOR_POSITION - this.scaledWidth;
				topBorder = 0;
				bottomBorder = bts.FIELD_HEIGHT - this.scaledHeight;
			}else{
				rightBorder = bts.FIELD_SEPARATOR_POSITION - this.scaledHeight;
				topBorder = this.scaledWidth;
				bottomBorder = bts.FIELD_HEIGHT;
			}

			if(this.nextPos.x && (this.nextPos.x < leftBorder || this.nextPos.x > rightBorder)){
				return false;
			}

			if(this.nextPos.y && (this.nextPos.y < topBorder || this.nextPos.y > bottomBorder)){
				return false;
			}
			return true;
		}

		/**
		 * Keeps the ship is inside field bounderies 
		 * by assigning new valid position 
		 * 
		 * @method keepShipInPlayerField
		 */
		p.keepShipInPlayerField = function(){
			let firstLine, firstRow, lastLine, lastRow;
			firstLine = 0;
			lastLine = Math.round(bts.FIELD_HEIGHT/bts.SECTION_SIZE);
			lastRow = Math.round((bts.FIELD_SEPARATOR_POSITION - bts.SCORE_BOARD_WIDTH)/bts.SECTION_SIZE);
			firstRow = 0;

			if(this.nextPos.row + this.nextPos.occupiedRows> lastRow){
				this.nextPos.row = lastRow - this.nextPos.occupiedRows -1;
			}
			else if(this.nextPos.row < 0){
				this.nextPos.row = 0;
			}

			if(this.nextPos.line + this.nextPos.occupiedLines > lastLine){
				this.nextPos.line = lastLine - this.nextPos.occupiedLines - 1;
			}
			else if(this.nextPos.line < 0){
				this.nextPos.line = 0;
			}

			this.nextPos.section = bts.getSectionByPosition(this.nextPos.row, this.nextPos.line).children[0];
		}

		/**
		 * Sets aditional information to the position
		 * from given x,y coordinates
		 * 
		 * @method setPostion
		 * @param {Object} position Object containing x,y coordinates
		 * @return {Object} Object with all aditional properties
		 */
		p.setPostion = function (position) {
			let nextPos = {}; 

			nextPos.x = position.x;
			nextPos.y = position.y;

			nextPos.row = Math.floor((nextPos.x - bts.SCORE_BOARD_WIDTH)/bts.SECTION_SIZE);

			nextPos.occupiedLines = this.getOccupiedLines();
			nextPos.occupiedRows = this.getOccupiedRows();

			if(this.orientation < 0 && nextPos.occupiedRows == 3){
				nextPos.line = Math.floor((nextPos.y - bts.SECTION_SIZE)/bts.SECTION_SIZE);
			}else{
				nextPos.line = Math.floor(nextPos.y/bts.SECTION_SIZE);
			}

			if(bts.getSectionByPosition(nextPos.row, nextPos.line)){
				nextPos.section = bts.getSectionByPosition(nextPos.row, nextPos.line).children[0];
			}

			return nextPos;
		}

		/**
		 * Checks if position is free and places the ship there if it is
		 * or returns it to previous position if not.
		 * Sets occupied sections.
		 * 
		 * @method positionShip
		 */
		p.positionShip = function (player) {
			let sprite = this.children[0];
			if(!player){
				if(!this.isShipInPlayerField()){
					this.keepShipInPlayerField();
				}
			}
			if(bts.isPositionOccupied(this.nextPos)){
				//checkes if the ship was alredy inside the field
				if(this.currPos){
					if(this.currPos.orientation && this.currPos.orientation != this.orientation){
						this.rotateShip();
						this.currPos.orientation = this.orientation;
					}
					sprite.x = this.currPos.x;
					sprite.y = this.currPos.y;
				}
			}else{
				let sectionPos, xPosinsideSection, yPosinsideSection;
				sectionPos = this.nextPos.section.graphics.command;

				yPosinsideSection = (bts.SECTION_SIZE*(Math.ceil(this.scaledHeight/bts.SECTION_SIZE)) - this.scaledHeight)/2;
				xPosinsideSection = (bts.SECTION_SIZE - this.scaledWidth)/2;

				if(this.orientation > 0){
					sprite.x = sectionPos.x + xPosinsideSection;
					sprite.y = sectionPos.y + yPosinsideSection;
				}else{
					sprite.x = sectionPos.x + yPosinsideSection;
					sprite.y = sectionPos.y + xPosinsideSection + this.scaledWidth;
				}
				if(this.currPos){
					this.freeOccupiedSections(this.currPos);
				}
				this.setOccupiedSections(this.nextPos);
				this.currPos = this.setPostion(this.nextPos);
			}

			if(bts.getShipsCoordinates().length == 6 && !bts.readyToStart){
				bts.stage.getChildByName('start button').setButtonListeners();
			}
		}

		/**
		 * Checks the ship orientation and returns number of lines ship occupies
		 * 
		 * @method getOccupiedLines
		 * @return {Number} Number of lines ship occupies
		 */
		p.getOccupiedLines = function () {
			if(this.orientation > 0){
				return Math.ceil(this.scaledHeight/bts.SECTION_SIZE);
			}else{
				return 1;
			}
		}

		/**
		 * Checks the ship orientation and returns number of rows ship occupies
		 * 
		 * @method getOccupiedRows
		 * @return {Number} Number of rows ship occupies
		 */
		p.getOccupiedRows = function(){
			if(this.orientation > 0){
				return 1;
			}else{
				return Math.ceil(this.scaledHeight/bts.SECTION_SIZE);
			}
		}

		/**
		 * Sets the sections occupied property and adds them to ship's occupiedSections property
		 * 
		 * @method setOccupiedSections
		 * @param {Object} position Extended position object
		 */
		p.setOccupiedSections = function (position) {
			let section;
			if(position.occupiedRows > 1){
				for(let i = position.row; i < position.row + position.occupiedRows; i += 1){
					section = bts.getSectionByPosition(i, position.line);
					section.children[0].occupied = true;
					this.occupiedSections.push(section);
				}
			}
			else if(position.occupiedLines > 1){
				for(let i = position.line; i < position.line + position.occupiedLines; i += 1){
					section = bts.getSectionByPosition(position.row, i);
					section.children[0].occupied = true;
					this.occupiedSections.push(section);
				}
			}else{
				section = bts.getSectionByPosition(position.row, position.line);
				section.children[0].occupied = true;
				this.occupiedSections.push(section);
			}
		}

		/**
		 * Sets the sections' occupied property and removes them from ship's occupiedSections property
		 * 
		 * @method freeOccupiedSections
		 * @param {Object} position Extended position object
		 */
		p.freeOccupiedSections = function (position){
			let section;
			if(position.occupiedRows > 1){
				for(let i = position.row; i < position.row + position.occupiedRows; i += 1){
					section = bts.getSectionByPosition(i, position.line);
					section.children[0].occupied = false;
				}
			}
			else if(position.occupiedLines > 1){
				for(let i = position.line; i < position.line + position.occupiedLines; i += 1){
					section = bts.getSectionByPosition(position.row, i);
					section.children[0].occupied = false;
				}
			}else{
				section = bts.getSectionByPosition(position.row, position.line);
				section.children[0].occupied = false;
			}
			while (this.occupiedSections.length > 0) {
		    this.occupiedSections.pop();
			}
		}
		// add to namespace
		bts.Ship = Ship;
	}())
}