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
			bts.sand = bts.queue.getResult('sand');

			bts.shipSpritesheet = new createjs.SpriteSheet(
				{
					images : [bts.queue.getResult('ships')],
					frames: bts.shipsSpritesheetData.frames,
					animations: bts.shipsSpritesheetData.animations
				}
			);
			bts.explosionSpriteSheet = new createjs.SpriteSheet(
				{
					images : [bts.queue.getResult('explosion')],
					frames: bts.explosionSpritesheetData.frames,
					animations: bts.explosionSpritesheetData.animations
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
				bts.stage.removeAllChildren();

				let field = new bts.Field();

				drawObsticles(data.obsticles, field);
				field.setPowerUpsInField(data.powerups);
				field.setMines(data.mines);
				bts.stage.addEventListener('stagemousedown', handleStageMovement);

				let sandSections = new createjs.Container();
				sandSections.addChild(...bts.sandBorder);
				bts.stage.addChild(sandSections);

				var ships = new createjs.Container();
				ships.name = 'ships';
				bts.stage.addChild(ships);
		}

		function drawObsticles(data, field){
			for(let i = 0; i< data.length; i+=1){
			let section = field.children[data[i]].children[0].graphics.command;
			field.drawIsland(section);
			}
		}

		function handleStageMovement (){
			bts.startPos = {
				mouseX: bts.stage.mouseX,
				mouseY: bts.stage.mouseY,
				x: bts.stage.x,
				y: bts.stage.y 
			}

			bts.stage.addEventListener('stagemousemove', function(e){
				let newPosition = {
					x: (bts.startPos.x + (bts.stage.mouseX - bts.startPos.mouseX)),
					y: (bts.startPos.y + (bts.stage.mouseY - bts.startPos.mouseY))
				}
				if(newPosition.x > -1660 && newPosition.x < 100){
					bts.stage.x = newPosition.x;
				}
				if(newPosition.y > -1530 && newPosition.y < 80){
					bts.stage.y = newPosition.y;
				}
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
						x: bts.sections[item.position].children[0].graphics.command.x,
						y: bts.sections[item.position].children[0].graphics.command.y
					}
					let section = bts.getSectionByCoordinates(position.x, position.y);

					let newShip = new bts.Ship(item.username, item.color, position, data.props);
					newShip.alpha = 0;

					if(bts.me == item.username){
						bts.myship = newShip;
						bts.myship.alpha = 1;
						bts.myship.drawRangeMarker();

						bts.stage.x = -position.x + 50;
						bts.stage.y = -position.y + 50;
						if(bts.stage.x < -1640){
							bts.stage.x += bts.stage.canvas.clientWidth - 100;
						}else if(bts.stage.x > 100){
							bts.stage.x -= bts.stage.canvas.clientWidth;
						}
						if(bts.stage.y < -1640){
							bts.stage.y += bts.stage.canvas.clientHeight - 100;
						}else if(bts.stage.y > 100){
							bts.stage.y += bts.stage.canvas.clientHeight;
						}
					}
				}
			});
		}

		function handleNewPosition(data){
			let ship = bts.stage.getChildByName('ships').children.find(item =>{ return item.name == data.name});
				
				bts.moveToNextPosition(
					ship, 
					{
						x: data.start.x, 
						y: data.start.y
					}, 
					{
						x: data.end.x,
						y: data.end.y
					}
				)
		}

		function handlePropChanges(data){
			data.props.forEach( item =>{
				let ship = bts.stage.getChildByName('ships').getChildByName(item.username);
				let oldProp = ship[item.powerup];
				ship[item.powerup] = item.amount;
				if(bts.me == item.username && item.powerup == 'range'){
					bts.myship.drawRangeMarker();
				}
				if(item.powerup == 'life'){
					if(oldProp > item.amount){
						ship.explodingAnimation();
					}
					ship.drawStats(ship.getChildByName('stats'));
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