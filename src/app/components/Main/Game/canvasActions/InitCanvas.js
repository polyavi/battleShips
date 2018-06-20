import Data from './Data';
import Field from './Field';
import Preloader from './Preloader';
import Section from './Section';
import Ship from './Ship';
import GameLogic from './GameLogic';

export default (me) =>{
	window.bts = {};
	Data.me = me;
	Data.stage = new createjs.Stage(document.getElementById('canvas'));
	
	Preloader(Data);

	Data.canvasCenter = {
		x: Data.stage.canvas.clientWidth / 2,
		y: Data.stage.canvas.clientHeight / 2
	};

	Field(Data);
	Section(Data);
	Ship(Data);
	GameLogic(Data);
};