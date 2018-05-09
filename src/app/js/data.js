/**
 * @module BattleShips
 */
export default ()=>{
  window.bts = window.bts || {};

	(function () {
		'use strict';
		bts.zoom;

		bts.images = [
			{
				id:'ships', 
				src:'images/ships.png'
			},
			{
				id:'sea', 
				src:'images/sea.jpg'
			},{
				id:"explosion", 
				src:'images/explosion.png'
			}
		];

		bts.shipsSpritesheetData = {
			frames: [
				[630, 135, 55, 110],
			],
	    animations: {
	    	ship: [0],
	    }
		};

		bts.explosionSpritesheetData = {
			frames: {width: 64, height: 64},
			animations: {
				explode: [0, 24, false]
			}
		};

		bts.strokeColor = '#4682B4';

		bts.myship;
		bts.fieldSize = 12;
		bts.sections = [];
		bts.startPos = {};
		bts.playerProps = {
			speed: 1,
			monitions: 10,
			life: 3,
			range: 3
		}

		bts.powerUps = ['speed', 'range', 'monitions', 'life'];
	}())
}