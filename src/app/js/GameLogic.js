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
			buidField();
			bts.buildShips();
		}

		function buidField() {
			let field = new bts.Field();
			bts.stage.canvas.addEventListener("mousewheel", mouseWheelHandler, false);
	    bts.stage.canvas.addEventListener("DOMMouseScroll", mouseWheelHandler, false);
			bts.stage.addEventListener('stagemousedown', handleStageMovement);
		}

		function mouseWheelHandler(e) {
	    if(Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))>0) bts.zoom=1.1; else bts.zoom=1/1.1;

	    bts.stage.scaleX = bts.stage.scaleY *= bts.zoom;
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

		bts.buildShips = function () {
			bts.shipSpritesheet = new createjs.SpriteSheet(
				{
					images : [bts.queue.getResult('ships')],
					frames: bts.shipsSpritesheetData.frames,
					animations: bts.shipsSpritesheetData.animations
				}
			);

		bts.myship = new bts.Ship('my ship', {x: bts.stage.canvas.clientWidth/2 + bts.fieldSize*76 , y: bts.stage.canvas.clientHeight/2 + bts.fieldSize*44}, bts.playerProps);
		}

		bts.startGame = function(){
			bts.stage.getChildByName('field').children.forEach(element => {
				if(element instanceof bts.Section && element.row > 5){
					element.addEventListeners();
				}
			});
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
		
		bts.preload();
	}())
}