/**
 * @module BattleShips
 */
export default ()=>{
  window.bts = window.bts || {};

	(function () {
		'use strict';

		bts.SCORE_BOARD_HEIGHT = 100;
		bts.SCORE_BOARD_WIDTH = 200;
		bts.LINE_HEIGHT = 50;
		bts.SECTION_SIZE = 65;
		bts.FIELD_HEIGHT = 455;
		bts.FIELD_WIDTH = 780;
		bts.FIELD_SEPARATOR_POSITION = bts.SCORE_BOARD_WIDTH + bts.FIELD_WIDTH/2;
		bts.LINES = Math.round(bts.FIELD_HEIGHT/bts.SECTION_SIZE);
		bts.ROWS = Math.round(bts.FIELD_WIDTH/bts.SECTION_SIZE);
		bts.BIG_SHIPS_COUNT = 1;
		bts.MEDIUM_SHIPS = 2;
		bts.SMALL_SHIPS = 3

		bts.images = [
			{
				id:'ships', 
				src:'images/ships.png'
			},
			{
				id:'water', 
				src:'images/water1.jpg'
			},{
				id:"explosion", 
				src:'images/explosion.png'
			}
		];

		bts.buttonsProps = {
			height: 40,
			width: 150,
			fontSize: 16,
			color: '#666',
			backgroundColor: '#cdcdcd',
			hoverColor: '#eee',
			inactiveColor: '#333'
		};

		bts.shipsData = {
			smallShip : {
				name: 'smallShip',
				y : bts.SCORE_BOARD_HEIGHT,
				x : 150,
				scale : 0.5,
				size: 1
			},
			mediumShip : {
				name: 'mediumShip',
				y : bts.SCORE_BOARD_HEIGHT,
				x : 100,
				scale : 0.7,
				size: 2
			},
			bigShip : {
				name: 'bigShip',
				y : bts.SCORE_BOARD_HEIGHT,
				x : 20,
				scale : 0.5,
				size: 3
			}
		};

		bts.shipsSpritesheetData = {
			frames: [
			//initial ships
				[445, 0 , 130, 360],
				[130, 405 , 65, 180],
				[630, 135, 55, 110],
			// hit ships
				[320, 0, 130, 360],
				[65, 405, 65, 180],
				[570, 135 , 55, 110]
			],
	    animations: {
	    	bigShip: [0],
	    	mediumShip: [1],
	    	smallShip: [2],
	    	hitBigShip: [3],
	    	hitMediumShip: [4],
	    	hitSmallShip: [5]
	    }
		};

		bts.explosionSpritesheetData = {
			frames: {width: 64, height: 64},
			animations: {
				explode: [0, 24, false]
			}
		};
	}())
}