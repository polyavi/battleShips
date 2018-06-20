let data = {
	images  : [
		{
			id: 'ships',
			src: 'images/ships.png'
		}, {
			id: 'sea',
			src: 'images/sea.jpg'
		}, {
			id: 'explosion',
			src: 'images/explosion.png'
		}, {
			id: 'rock',
			src: 'images/rock.png'
		}, {
			id: 'sand',
			src: 'images/sand.jpg'
		}
	],
	shipsSpritesheetData  : {
		frames: [
			[630, 135, 55, 110],
		],
		animations: {
			ship: [0],
		}
	},
	explosionSpritesheetData  : {
		frames: {
			width: 64,
			height: 64
		},
		animations: {
			explode: [0, 24, false]
		}
	},
	strokeColor  : '#4682B4' ,
	sections  : [] ,
	sandBorder  : []
};

export default data;