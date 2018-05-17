/**
* @module BattleShips
*/
export default ()=>{
  window.bts = window.bts || {};

	(function () {
		'use strict';

		/**
		 * Initialize the game
		 *
		 * @method init
		 */
		
		bts.initGame = function () {
			bts.stage.removeChild(bts.preloader);
			bts.backgroundImage = bts.queue.getResult('sea');
			bts.island = bts.queue.getResult('island');

			bts.shipSpritesheet = new createjs.SpriteSheet(
				{
					images : [bts.queue.getResult('ships')],
					frames: bts.shipsSpritesheetData.frames,
					animations: bts.shipsSpritesheetData.animations
				}
			);
			bts.canvasCenter = {
				x: bts.stage.canvas.clientWidth/2,
				y: bts.stage.canvas.clientHeight/2
			}

			addSocketListeners();
		}

		function buidField(data) {
				bts.fieldSize = data.size;
				if(!bts.stage.getChildByName('field')){
					let field = new bts.Field();
					drawObsticles(data.obsticles, field);
					field.setPowerUpsInField(data.powerups);
					bts.stage.canvas.addEventListener("mousewheel", mouseWheelHandler, false);
			    bts.stage.canvas.addEventListener("DOMMouseScroll", mouseWheelHandler, false);
					bts.stage.addEventListener('stagemousedown', handleStageMovement);
				}

				let ships = new createjs.Container();
				ships.name = 'ships';
				bts.stage.addChild(ships);
		}

		function drawObsticles(data, field){
			for(let i = 0; i< data.length; i+=1){
			let section = field.children[data[i]].children[0].graphics.command;
			field.drawIsland(section);
			}
		}

		function mouseWheelHandler(e) {
	    if(Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))>0) bts.zoom=1.1; else bts.zoom=1/1.1;
	    let scale = bts.stage.scaleX*bts.zoom

	    if(scale < 0.5){ 
	    	scale = 0.5; 
	    }else if(scale > 1){
	    	scale = 1;
	    }

	    bts.stage.scaleX = bts.stage.scaleY = scale;
	  }

		function handleStageMovement (){
			bts.startPos = {
				mouseX: bts.stage.mouseX,
				mouseY: bts.stage.mouseY,
				x: bts.stage.x,
				y: bts.stage.y 
			}

			bts.stage.addEventListener('stagemousemove', function(e){
				bts.stage.x = bts.startPos.x + (bts.stage.mouseX - bts.startPos.mouseX);
				bts.stage.y = bts.startPos.y + (bts.stage.mouseY - bts.startPos.mouseY);
			});

			bts.stage.addEventListener('stagemouseup', function (e) {
				bts.stage.removeAllEventListeners();
				bts.stage.addEventListener('stagemousedown', handleStageMovement)
			});
		}

		function positionShips(data){
			let ships = bts.stage.getChildByName('ships').children;

			data.positions.forEach(item =>{
				if(!ships.find(ship => { return ship.name == item.username})){
					let position = {
						x: bts.canvasCenter.x + item.position.x,
						y: bts.canvasCenter.y + item.position.y
					}
					let section = bts.getSectionByCoordinates(position.x, position.y);

					let newShip = new bts.Ship(item.username, item.color, position, data.props);

					if(bts.me == item.username){
						bts.myship = newShip;
						bts.myship.drawRangeMarker();
						bts.stage.x -= item.position.x;
						bts.stage.y -= item.position.y;
					}
				}
			});
		}

		function handleNewPosition(data){
			let ship = bts.stage.getChildByName('ships').children.find(item =>{ return item.name == data.name});
				
				bts.moveToNextPosition(
					ship, 
					{
						x: data.start.x + bts.canvasCenter.x, 
						y: data.start.y + bts.canvasCenter.y
					}, 
					{
						x: data.end.x + bts.canvasCenter.x,
						y: data.end.y + bts.canvasCenter.y
					}
				)
		}

		function handlePropChanges(data){
			data.forEach( item =>{
				let ship = bts.stage.getChildByName('ships').getChildByName(item.username);
				ship[item.powerup] = item.amount;
				if(bts.me == item.username && item.powerup == 'range'){
					bts.myship.drawRangeMarker();
				}
				if(item.powerup == 'life'){
					ship.drawLife(ship.getChildByName('stats').getChildByName('life'));
				}
			})
		}

		function handleSinking(shipName){
			let ship = bts.stage.getChildByName('ships').getChildByName(shipName);
				bts.stage.getChildByName('ships').removeChild(ship);
				if(shipName == bts.me){
					bts.stage.getChildByName('field').children.forEach(section =>{
						bts.stage.removeChild(bts.stage.getChildByName('range'));
						section.removeAllEventListeners();
					})
				}
		}

		function addSocketListeners(){
			window.socket.emit('canvas init');

			window.socket.on('init field', function(data){
				buidField(data);
			});

			window.socket.on('positions', function(data) {
				positionShips(data);
			})

			window.socket.on('allow movement', function(){
				bts.stage.getChildByName('field').children.forEach(section =>{
					if(!section.occupied){
						section.addEventListener('click', section.handleInteraction);
					}
				})
			})

			window.socket.on('new position', (data)=>{
				handleNewPosition(data);
			})

			window.socket.on('remove powerup', (powerup)=>{
				let section = bts.stage.getChildByName('field').children[powerup.section];
				section.removePowerUp();
			})

			window.socket.on('add powerup', (powerup)=>{
				let section = bts.stage.getChildByName('field').children[powerup.section];
				section.addPowerUp(powerup);
			})

			window.socket.on('prop change', function(data){
				handlePropChanges(data);
			});

			window.socket.on('player sunk', function(shipName) {
				handleSinking(shipName);
			});

			window.socket.on('remove ship', function(shipName) {
				let ship = bts.stage.getChildByName('ships').getChildByName(shipName);
				bts.stage.getChildByName('ships').removeChild(ship);
			})
		}
		
		bts.preload();
	}())
}