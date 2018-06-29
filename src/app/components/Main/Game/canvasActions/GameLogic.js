/**
* @module BattleShips
*/
export default (Data)=>{
  window.bts = window.bts || {};

	(function () {
		'use strict';
		let stage = Data.stage;
		/**
		 * Initialize the game
		 *
		 * @method initGame
		 */
		Data.init = function () {
			createjs.Ticker.on('tick', Data.stage);
			Data.stage.enableMouseOver();

			Data.preloader = new bts.Preloader('#666', '#fff');
			Data.preloader.x = (Data.stage.canvas.width / 2) - (Data.preloader.width / 2);
			Data.preloader.y = (Data.stage.canvas.height / 2) - (Data.preloader.height / 2);
			Data.stage.addChild(Data.preloader);

			Data.queue.addEventListener('complete', initGame);
			Data.queue.addEventListener('progress', bts.onFileProgress);
			Data.queue.load();
		};

		function initGame() {
			stage.removeChild(Data.preloader);

			Data.backgroundImage = Data.queue.getResult('sea');
			Data.rock = Data.queue.getResult('rock');
			Data.sand = Data.queue.getResult('sand');

			Data.shipSpritesheet = new createjs.SpriteSheet(
				{
					images : [Data.queue.getResult('ships')],
					frames: Data.shipsSpritesheetData.frames,
					animations: Data.shipsSpritesheetData.animations
				}
			);

			Data.explosionSpriteSheet = new createjs.SpriteSheet(
				{
					images : [Data.queue.getResult('explosion')],
					frames: Data.explosionSpritesheetData.frames,
					animations: Data.explosionSpritesheetData.animations
				}
			);

			addSocketListeners();
		}

		/**
		 * Initiates drawing of sections, powerups, mines, ships and obsticles
		 *
		 * @method buidField
		 * @param {Object} fieldProps The field data
		 */
		function buidField(fieldProps) {
			Data.fieldSize = fieldProps.size;
			stage.removeAllChildren();

			let field = new bts.Field();

			drawObsticles(fieldProps.obsticles, field);
			field.setPowerUpsInField(fieldProps.powerups);
			field.setMines(fieldProps.mines);
			stage.addEventListener('stagemousedown', handleStageMovement);

			let sandSections = new createjs.Container();
			sandSections.addChild(...Data.sandBorder);
			stage.addChild(sandSections);

			var ships = new createjs.Container();
			ships.name = 'ships';
			stage.addChild(ships);
		}

		/**
		 * Draws obsticles
		 *
		 * @method drawObsticles
		 * @param {Object} obsticles the positions of the obsicles
		 * @param {createjs.Container} field 
		 */
		function drawObsticles(obsticles, field){
			for(let i = 0; i< obsticles.length; i+=1){
			field.children[obsticles[i]].drawRock();
			}
		}

		function moveStage(stage){
			let newPosition = {
				x: (Data.stagePosition.x + (stage.mouseX - Data.stagePosition.mouseX)),
				y: (Data.stagePosition.y + (stage.mouseY - Data.stagePosition.mouseY))
			};
			if(newPosition.x > -88*(Data.fieldSize*3/2 + 2) && newPosition.x < 100){
				stage.x = newPosition.x;
			}
			if(newPosition.y > -59*(Data.fieldSize*2 + 2) && newPosition.y < 80){
				stage.y = newPosition.y;
			}
		}
		/**
		 * Handles field draging
		 *
		 * @method handleStageMovement
		 */
		function handleStageMovement (){
			Data.stagePosition = {
				mouseX: stage.mouseX,
				mouseY: stage.mouseY,
				x: stage.x,
				y: stage.y 
			};

			stage.addEventListener('stagemousemove', function(e){
				moveStage(stage);
			});

			stage.addEventListener('stagemouseup', function (e) {
				stage.removeAllEventListeners();
				stage.addEventListener('stagemousedown', handleStageMovement);
			});
		}

		/**
		 * @method positionShips
		 * @param {Object} shipsProps the positions, stats and names of all ships
		 */
		function positionShips(shipsProps){
			let ships = stage.getChildByName('ships').children;

			shipsProps.positions.forEach(item =>{
				if(!ships.find(ship => { return ship.name == item.username;})){
					let position = {
						x: Data.sections[item.position].children[0].graphics.command.x,
						y: Data.sections[item.position].children[0].graphics.command.y
					};
					let section = bts.getSectionByCoordinates(position.x, position.y);

					let newShip = new bts.Ship(item.username, item.color, position, shipsProps.props);
					newShip.alpha = 0;

					if(Data.me == item.username){
						Data.myship = newShip;
						Data.myship.alpha = 1;
						Data.myship.drawRangeMarker();

						stage.x = -position.x + 50;
						stage.y = -position.y + 50;

						if(stage.x < -88*(Data.fieldSize*3/2+2)) stage.x += stage.canvas.clientWidth - 100;
						else if(stage.x > 100) stage.x -= stage.canvas.clientWidth; 

						if(stage.y < -59*(Data.fieldSize*2 + 2)) stage.y += stage.canvas.clientHeight - 100;
						else if(stage.y > 100) stage.y += stage.canvas.clientHeight;
					}
				}
			});
		}

		/**
		 * @method positionShips
		 * @param {Object} shipsProps new position and name of ship
		 */
		function handleNewPosition(shipsProps){
			let ship = stage.getChildByName('ships').children.find(item =>{ return item.name == shipsProps.name;});
				
				bts.moveToNextPosition(
					ship, 
					{
						x: shipsProps.start.x, 
						y: shipsProps.start.y
					}, 
					{
						x: shipsProps.end.x,
						y: shipsProps.end.y
					}
				);
		}

		/**
		 * @method handlePropChanges
		 * @param {Object} changedProps names of ships and the name and value of changed props
		 */
		function handlePropChanges(changedProps){
			changedProps.props.forEach( item =>{
				let ship = stage.getChildByName('ships').getChildByName(item.username);
				let oldProp = ship[item.powerup];
				ship[item.powerup] = item.amount;
				if(Data.me == item.username && item.powerup == 'range'){
					Data.myship.drawRangeMarker();
				}
				if(item.powerup == 'life'){
					if(oldProp > item.amount){
						ship.explodingAnimation();
					}
					ship.drawStats(ship.getChildByName('stats'));
				}
			});
		}

		/**
		 * @method handleSinking
		 * @param {String} shipName
		 */
		function handleSinking(shipName){
			let ship = stage.getChildByName('ships').getChildByName(shipName);
				stage.getChildByName('ships').removeChild(ship);
				if(shipName == Data.me){
					stage.getChildByName('field').children.forEach(section =>{
						stage.removeChild(stage.getChildByName('range'));
						section.removeAllEventListeners();
					});
				}
		}

		/**
		 * adds all socket interations
		 * 
		 * @method addSocketListeners
		 */
		function addSocketListeners(){
			window.socket.emit('canvas init');

			window.socket.on('init field', function(fieldProps){ buidField(fieldProps); });

			window.socket.on('positions', function(shipsProps) { positionShips(shipsProps); });

			window.socket.on('allow movement', function(){
				stage.getChildByName('field').children.forEach(section =>{
					if(section instanceof bts.Section && !section.occupied){
						section.addEventListener('click', section.handleInteraction);
						section.neighbors = section.getNeighbors();
					}
				});
			});

			window.socket.on('new position', (shipsProps)=>{ handleNewPosition(shipsProps); });

			window.socket.on('remove powerup', (powerup)=>{
				let section = stage.getChildByName('field').children[powerup.section];
				section.removePowerUp();
			});

			window.socket.on('add powerup', (powerup)=>{
				let section = stage.getChildByName('field').children[powerup.section];
				section.addPowerUp(powerup);
			});

			window.socket.on('prop change', function(changedProps){ handlePropChanges(changedProps); });

			window.socket.on('player sunk', function(shipName) { handleSinking(shipName); });

			window.socket.on('remove ship', function(shipName) {
				let ship = stage.getChildByName('ships').getChildByName(shipName);
				stage.getChildByName('ships').removeChild(ship);
			});
		}
		
		bts.preload();
	}());
};