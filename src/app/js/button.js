/**
* @module BattleShips
*/
export default ()=>{
	window.bts = window.bts || {};

	(function () {
		'use strict';

		let Button = function (props) {
			this.height = props.height;
			this.width = props.width;
			this.label = props.labelTxt;
			this.fontSize = props.fontSize;
			this.color = props.color;
			this.backgroundColor = props.backgroundColor;
			this.hoverColor = props.hoverColor;
			this.inactiveColor = props.inactiveColor;

			this.initialize();
		}

		let p = Button.prototype = new createjs.Container();
		p.Container_initialize = p.initialize;

		p.initialize = function () {
			this.Container_initialize();
			this.drawButton(this.inactiveColor);
		}

		p.drawButton = function(backgroundColor){
			this.removeAllChildren();
			this.labelTxt = new createjs.Text(this.label, this.fontSize + 'px Arial', this.color);
			this.labelTxt.textAlign = 'center';
			this.labelTxt.textBaseline = 'top';

			this.labelTxt.x = this.width / 2;
			this.labelTxt.y = 10;

			this.background = new createjs.Shape();
			this.background.graphics.beginStroke(this.color)
			.beginFill(backgroundColor)
			.drawRect(0,0,this.width,this.height);

			this.addChild(this.background,this.labelTxt);
		}

		p.setButtonListeners = function(){
			this.cursor = 'pointer';
			this.on('rollover',this.onButtonOver);
			this.on('rollout',this.onButtonOut);
			this.on('click', this.onButtonClick);

			this.drawButton(this.backgroundColor);
		}

		p.onButtonOver = function(){
			this.drawButton(this.hoverColor);
		}

		p.onButtonOut = function(){
			this.drawButton(this.backgroundColor);
		}

		p.onButtonClick = function(){
			this.removeAllEventListeners();
			bts.stage.removeChild(this);

			bts.socket.emit('start game', bts.getShipsCoordinates());
			bts.readyToStart = true;
			bts.stage.children.forEach(child => {
				if(child instanceof bts.Ship){
					child.removeAllEventListeners();
				}
			});
			if(bts.opponentShipsPositions){
				bts.startGame();
				bts.showMessage('Game starts. It is your turn.');
				setTimeout(() =>{ bts.hideMessage(); }, 2000);
			}
		}

		bts.Button = Button;
	}());
}