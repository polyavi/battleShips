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
				bts.data = bts.queue.getResult('data');
				bts.stage.removeChild(bts.preloader);
				bts.buidField();
				bts.buildScoreBoard();
				bts.buildShips();
		}

		bts.buildScoreBoard = function () {
			let player1Txt, player2Txt, shipsCount;
			bts.board = new createjs.Container();
			shipsCount = bts.getAllShipsCount();

			player1Txt = bts.drawPlayerText(bts.me, shipsCount, 1);
			player2Txt = bts.drawPlayerText (bts.oponent, shipsCount, 2);

			bts.board.addChild(player1Txt, player2Txt);

			bts.board.name = 'board';
			bts.stage.addChild(bts.board);

			bts.drawStartButton('Start Game', 25, 300);
		}

		bts.drawPlayerText = function (player, shipsCount, line){
			let text = new createjs.Text(player + ': ' + shipsCount + ' ships', '16px Tahoma', '#fff');

			text.y = 10 + bts.LINE_HEIGHT*(line - 1);
			text.x = 10;
			text.name = player
			text.shipsCount = shipsCount;

			return text;
		}

		bts.buidField = function () {
			bts.drawFieldBackground();
			bts.drawFieldSections();
			bts.drawSeparatonLine();
		}

		bts.drawFieldBackground = function () {
			let background = new createjs.Bitmap(bts.queue.getResult('water'));
			background.sourceRect = new createjs.Rectangle(0, 0, bts.FIELD_WIDTH, bts.FIELD_HEIGHT);

			background.alpha = 0.8;
			//background.scaleX = 1.2;
			background.x = bts.SCORE_BOARD_WIDTH;
			background.y = 0;

			background.name = 'background';
			bts.stage.addChild(background);
		}

		bts.drawSeparatonLine = function () {
			let separationLine = new createjs.Shape();
			separationLine.graphics
				.setStrokeStyle(4).beginStroke('#666')
				.moveTo(bts.FIELD_SEPARATOR_POSITION, 0)
				.lineTo(bts.FIELD_SEPARATOR_POSITION, bts.FIELD_HEIGHT);

			separationLine.name = 'separator';
			bts.stage.addChild(separationLine);
		}

		bts.drawFieldSections = function () {
			let sectionsContainer = new createjs.Container();
			let sections = [];
			let line = 0;

			for (let j = 0; j < bts.ROWS*bts.LINES; j++) {
				if(Math.floor(j/bts.ROWS) > line){
					line += 1;
				}
				let row = Math.floor(j - line*bts.ROWS);
				let section = new bts.Section(row, line);

				sections.push(section);
			}

			sectionsContainer.addChild(...sections);

			sectionsContainer.name = 'field';
			bts.stage.addChild(sectionsContainer);
		}

		bts.buildShips = function () {
			bts.shipSpritesheet = new createjs.SpriteSheet(
				{
					images : [bts.queue.getResult('ships')],
					frames: bts.shipsSpritesheetData.frames,
					animations: bts.shipsSpritesheetData.animations
				}
			);

			bts.drawPlayerShips();
		}

		bts.drawPlayerShips = function () {
			let i, allShips = [];

			for (i = 0; i < bts.BIG_SHIPS_COUNT; i++) {
				let ship = new bts.Ship(bts.shipsData.bigShip);
				allShips.push(ship);
			}

			for (i = 0; i < bts.MEDIUM_SHIPS; i++) {
				let ship = new bts.Ship(bts.shipsData.mediumShip);
				allShips.push(ship);
			}

			for (i = 0; i < bts.SMALL_SHIPS; i++) {
				let ship = new bts.Ship(bts.shipsData.smallShip);
				allShips.push(ship);
			}

			bts.stage.addChild(...allShips);
		}

		bts.setSectionsOccupiedByOponentShips = function (){
			bts.opponentShipsPositions.forEach( function(position) {
				position.section = bts.getSectionByPosition(position.row, position.line).children[0];

				let section = position.section.graphics.command;
				let ship;

				position.x = section.x;
				position.y = section.y;


				if(position.size == 3){
					ship = new bts.Ship(bts.shipsData.bigShip);
				}
				else if(position.size == 2){
					ship = new bts.Ship(bts.shipsData.mediumShip);
				}else{
					ship = new bts.Ship(bts.shipsData.smallShip);
				}
				if(position.orientation < 0){
					ship.rotateShip();
				}

				position.occupiedLines = ship.getOccupiedLines();
				position.occupiedRows = ship.getOccupiedRows();

				ship.removeAllEventListeners();
				ship.nextPos = position;
				ship.positionShip(2);
				ship.visible = false;
				bts.stage.addChild(ship);
			});
		}

		bts.drawStartButton = function(label, x, y){
			bts.buttonsProps.labelTxt = 'Start Game';
			let button = new bts.Button(bts.buttonsProps);

			button.x = x;
			button.y = y;
			button.name = 'start button';

			bts.stage.addChild(button);
		}

		bts.drawGameOverButton = function(label, x, y){
			bts.buttonsProps.labelTxt = 'New Game';
			let button = new bts.Button(bts.buttonsProps);

			button.x = x;
			button.y = y;
			button.name = 'game over';

			bts.stage.addChild(button);
		}

		bts.startGame = function(){
			bts.stage.getChildByName('field').children.forEach(element => {
				if(element instanceof bts.Section && element.row > 5){
					element.addEventListeners();
				}
			});
		}

		bts.getShipsCoordinates = function(){
			let shipsCoordinates = [];
			bts.stage.children.forEach( child =>{
				if(child instanceof bts.Ship && child.nextPos){
					if(child.nextPos.row < 6 && child.nextPos.row > -1 && child.nextPos.line > -1 && child.nextPos.line < bts.LINES){
						let coordinates = {
							row: child.nextPos.row + 6,
							line: child.nextPos.line,
							orientation: child.orientation,
							size: child.size
						}
						shipsCoordinates.push(coordinates);
					}
				}
			})
			return shipsCoordinates; 
		}

		bts.getAllShipsCount = function () {
			return bts.BIG_SHIPS_COUNT +	bts.MEDIUM_SHIPS + bts.SMALL_SHIPS;
		}

		bts.decreasePlayerShips = function(section){
			let textElement, player, line;

			if(section.row < 6){
				player = bts.me;
				line = 1;
			}else{
				player = bts.oponent;
				line = 2;
			}

			textElement = bts.stage.getChildByName('board').getChildByName(player);

			textElement.shipsCount -=1;
			textElement.text = player + ': ' + textElement.shipsCount + ' ships';

			bts.stage.update();
			if(bts.isGameOver(textElement.shipsCount)){
				bts.finishGame = true;
				bts.gameOver(player);
			}
		}

		bts.isGameOver = function(shipsCount){
			if(shipsCount === 0){
						return true;
			}
			return false;
		}

		bts.gameOver = function(loserusername){
			if(loserusername == bts.me){
				bts.showMessage('Game Over. You Lose.');

			}else{
				bts.showMessage('Congartulations. You win.');
			}
		}
	}())
}