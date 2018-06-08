let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let port = process.env.PORT || 3000;

app.use('/dist/app', express.static(__dirname + '/dist/app'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/images', express.static(__dirname + '/images'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use(redirectUnmatched);

function redirectUnmatched(req, res) {
	res.redirect("/");
}

const FIELD_SIZE = 12;
const NUMBER_OF_SECTIONS = FIELD_SIZE * 72;
const SHIP_POSITIONS = [0, FIELD_SIZE*2 - 1, NUMBER_OF_SECTIONS / 2 - 1, NUMBER_OF_SECTIONS / 2 - FIELD_SIZE*2, NUMBER_OF_SECTIONS - FIELD_SIZE*2, NUMBER_OF_SECTIONS - 1];
const POWERUP_TYPES = ['speed', 'range', 'monitions', 'life'];
const PLAYER_PROPS = {
	speed: Math.ceil(FIELD_SIZE/12),
	monitions: Math.ceil(FIELD_SIZE/4),
	life: 3,
	range: Math.ceil(FIELD_SIZE/12)
};

io.on('connection', function(socket) {
	socket.on('add user', function(username) {
		let existingUser = getAllUsersData().find(user => {
			return user.username == username
		});
		if (existingUser) {
			socket.emit('taken username');
		} else {
			socket.username = username;
			socket.color = '#' + Math.random().toString(16).substr(2, 6);

			socket.emit('logged in', {
				username,
				id: socket.id,
				allUsers: getAllUsersData(),
				allRooms: getAllRoomsData()
			});

			socket.broadcast.emit('new user', {
				username,
				id: socket.id,
				color: socket.color
			});
		}
	});

	socket.on('join room', function(roomProps) {
		let room = io.sockets.adapter.rooms[roomProps.room];

		logInExistingRoom(room, roomProps, socket);
	});

	socket.on('create room', function(roomProps) {	
		socket.join(roomProps.room);

		let room = io.sockets.adapter.rooms[roomProps.room];

		setRoom(roomProps.room, roomProps.pass, socket, room);
		setNewPlayer(socket, room);

		socket.emit('created room', {
			userId: socket.id,
			roomId: room.id,
			name: roomProps.room,
			hasPass: room.hasPass,
			admin: true
		});

		socket.broadcast.emit('new room', {
			roomId: room.id,
			name: roomProps.room,
			hasPass: room.hasPass,
			admin: false
		});
	});

	socket.on('remove room', function(){removeRoom(socket);});

	socket.on('leave room', function() {
		let room = io.sockets.adapter.rooms[socket.room];

		io.to(socket.room).emit('system message', createMessage(
				' left the game.',
				socket,
				room
			));

		io.to(socket.room).emit('remove ship', socket.username);

		socket.emit('close room')
		socket.emit('system message', createMessage(' left ' + socket.room, socket, room.name));

		socket.leave(socket.room);
		socket.room = '';

		io.emit('rooms', getAllRoomsData());
	});

	socket.on('direct message', function({text, name}) {
		let reciever = getSocketByUsername(name);
		if(reciever){
			io.to(reciever.id).emit('message', createMessage(text, socket, socket.username));
			socket.emit('message', createMessage(text, socket, name));
		}else{
			io.to(name).emit('message', createMessage(text, socket, name));
		}
	});

	socket.on('global message', function(text) {
		io.emit('message', createMessage(text, socket, 'global'));
	});

	socket.on('canvas init', function() {
		initField(socket);
	});

	socket.on('start game', function() {
		io.to(socket.room).emit('allow movement');
		let room = io.sockets.adapter.rooms[socket.room];
		room.gameStarted = true;

		io.to(room.name).emit('system message', createMessage(' started the game.',socket, room.name));
	});

	socket.on('move', function(start, end) {
		socket.broadcast.to(socket.room).emit('new position', {
			start: start,
			end: end,
			name: socket.username
		});
	});

	socket.on('collect powerup', function(powerup) {
		if (powerup.type == 'speed') {
			increaseSpeed(socket);
		} else if (powerup.type == 'range') {
			increaseRange(socket);
		} else if (powerup.type == 'life') {
			increaseLife(socket);
		} else if (powerup.type == 'monitions') {
			increaseMonitions(socket);
		}

		io.to(socket.room).emit('prop change', {
			props: [generateProp(powerup.type, socket)]
		});

		let room = io.sockets.adapter.rooms[socket.room];

		io.to(room.name).emit('system message', createMessage(' collected ' + powerup.type + ' power up.', socket, room.name));

		let newPowerUp = createPowerUp(powerup.type, room);
		while (!newPowerUp) {
			newPowerUp = createPowerUp(powerup.type, room);
		}

		room.powerups.splice(room.powerups.indexOf(powerup), 1, newPowerUp);
		room.occupiedSections.splice(room.occupiedSections.indexOf(powerup.section), 1, newPowerUp.section);

		setTimeout(() => {
			io.to(socket.room).emit('add powerup', newPowerUp);
		}, 5000);
	});

	socket.on('steped on mine', function(username) {
		let socket = getSocketByUsername(username);
		resetRange(socket);
		resetSpeed(socket);

		io.to(socket.room).emit('prop change', {
			props: [generateProp('speed', socket), generateProp('range', socket)]
		});

		io.to(socket.room).emit('system message', createMessage(
				' steped on mine and lost all speed and range enhansments.',
				socket,
				socket.room
			));
	});
	// TO DO separate
	socket.on('hit', function(data) {
		if (socket.props.monitions > 0) {
			let target = getSocketByUsername(data.name);

			if (target.props.life > 0) {
				decreaseMonitions(socket);
				decreaseLife(target);

				io.to(socket.room).emit('prop change', {
					props: [generateProp('monitions', socket), generateProp('life', target)],
				});

				if (target.props.life == 0) {
					io.to(socket.room).emit('player sunk', data.name);

					let alivePlayers = getAlivePlayers(io.sockets.adapter.rooms[socket.room]);

					if (alivePlayers.length == 1) {

						io.to(socket.room).emit('game over', socket.username);
						let room = io.sockets.adapter.rooms[socket.room];
						room.restart = false;
						room.gameStarted = false;
					} else {
						io.to(socket.room).emit('system message', createMessage(
								' atacked ' + data.name + ' and sunk their ship.',
								socket,
								socket.room
							));
					}
				} else {
					io.to(socket.room).emit('system message', createMessage(
							' atacked ' + data.name + ' and lost life.',
							socket,
							socket.room
						));
				}
			}
		}
	});

	socket.on('play again', function() {
		let room = io.sockets.adapter.rooms[socket.room];

		if (!room.restart) {
			room.restart = true;
			setFieldProps(room);
		}
		setNewPlayer(socket, room);
		initField(socket);

		socket.emit('restart', socket.room)
	});

	socket.on('disconnect', function() {
		io.emit('remove user', socket.id);
		removeRoom(socket); 
	});
});
function removeRoom(socket) {
	let room = io.sockets.adapter.rooms[socket.room];
	if(socket && room){
		let sockets = Object.keys(room.sockets);

		io.to(socket.room).emit('system message', createMessage(
				' left and the room was lost. Please choose another room to play.',
				socket,
				'global'
			));

		sockets.forEach(socket => {
			io.sockets.connected[socket].leave(socket.room);
		});

		socket.leave(socket.room);
		socket.room = '';

		io.emit('removed room', room.id);
	}
}
function initField(socket) {
	let room = io.sockets.adapter.rooms[socket.room];
	socket.emit(
		'init field', {
			size: FIELD_SIZE,
			powerups: room.powerups,
			obsticles: room.obsticles,
			occupied: room.occupiedSections,
			mines: room.mines
		});

	io.to(room.name).emit('positions', {
		positions: room.positions,
		props: PLAYER_PROPS
	});

	if (room.gameStarted) {
		socket.emit('allow movement');
	}
}

function logInExistingRoom(room, password, socket) {
	if (room && room.hasPass && room.pass !== password) {
		socket.emit('wrong pass');
	} else {
		socket.join(room.name);
		setNewPlayer(socket, room);

		socket.emit('joined room',
		{ 
			userId: socket.id,
			roomId: room.id,
			length: room.length,
			admin: false
		});

		io.to(room.name).emit('system message', createMessage(
			' joined the game.',
			socket,
			room
		));
	}
}

function setRoom(roomname, password, socket, room) {
	room.name = roomname;
	room.admin = socket.id;
	room.id = room.name + socket.id;

	setFieldProps(room);

	if (password != '') {
		room.hasPass = true;
		room.pass = password;
	} else {
		room.hasPass = false;
	}
}

function setFieldProps(room) {			
	room.availablePositions = SHIP_POSITIONS.slice();
	console.log(room.availablePositions)
	room.positions = [];
	room.occupiedSections = [];
	room.obsticles = generateObsticles(room);
	room.powerups = genreratePowerUps(room);
	room.mines = generateMines(room);
}

function setNewPlayer(socket, room) {
	socket.room = room.name;
	socket.props = Object.assign({}, PLAYER_PROPS);

	let randomPosition = Math.floor(Math.random() * room.availablePositions.length);
	room.positions.push({
		position: SHIP_POSITIONS[randomPosition],
		username: socket.username,
		color: socket.color
	});
	room.availablePositions.splice(randomPosition, 1);
	console.log(room.availablePositions)
}

function getAlivePlayers(room) {
	let keys = Object.keys(room.sockets);
	let usersData = [];

	keys.forEach(function(key) {
		let socket = io.sockets.sockets[key];
		if (socket.props.life > 0) {
			usersData.push(key)
		}
	});
	return usersData;
}

function getAllUsersData() {
	let keys = Object.keys(io.sockets.sockets);
	let usersData = [];

	keys.forEach(function(key) {
		let socket = io.sockets.sockets[key];
		if (socket.username) {
			usersData.push({
				username: socket.username,
				id: socket.id,
				color: socket.color
			})
		}
	});
	return usersData;
}

function getSocketByUsername(name) {
	let keys = Object.keys(io.sockets.sockets);

	let socket = io.sockets.sockets[keys.find(function(key) {
		return io.sockets.sockets[key].username == name;
	})];
	return socket;
}

function getAllRoomsData() {
	let keys = Object.keys(io.sockets.adapter.rooms);
	let roomsData = [];

	keys.forEach(function(key) {
		let room = io.sockets.adapter.rooms[key];
		if (room.name && room.length != 0) {
			roomsData.push({
				name: room.name,
				hasPass: room.hasPass,
				length: room.length,
				id: room.id
			})
		}
	});
	return roomsData;
}

function createMessage(text, sender, receiver) {
	return {
		sender: {
			name: sender.username,
			color: sender.color
		},
		to: receiver,
		text: text,
		time: formatTime(new Date())
	}
}

function formatTime(date) {
	return date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
}

// game logic methods
function increaseSpeed(socket) {
	socket.props.speed += 1;
}

function resetSpeed(socket) {
	socket.props.speed = PLAYER_PROPS.speed;
}

function decreaseLife(socket) {
	socket.props.life -= 1;
}

function increaseLife(socket) {
	socket.props.life += 1;
}

function increaseRange(socket) {
	socket.props.range += 1;
}

function resetRange(socket) {
	socket.props.range = PLAYER_PROPS.range;
}

function increaseMonitions(socket) {
	socket.props.monitions += 3;
}

function decreaseMonitions(socket) {
	socket.props.monitions -= 1;
}

function generateProp(powerup, socket) {
	return {
		powerup: powerup,
		amount: socket.props[powerup],
		username: socket.username
	};
}

function genreratePowerUps(room) {
	let powerUps = [];
	let count = POWERUP_TYPES.length * FIELD_SIZE / 2;

	while (count > 0) {
		let type = POWERUP_TYPES[count % POWERUP_TYPES.length];
		let powerup = createPowerUp(type, room);
		if (powerup) {
			powerUps.push(powerup);
			room.occupiedSections.push(powerup.section);
			count -= 1;
		}
	}

	return powerUps;
}

function createPowerUp(type, room) {
	let section = Math.floor(Math.random() * NUMBER_OF_SECTIONS);

	if (!isOccupied(room, section)) {
		return {
			section: section,
			type: type
		}
	}
}

function generateObsticles(room) {
	let obsticles = [];
	let count = Math.max(6, Math.floor(Math.random() * FIELD_SIZE));
	while (count > 0) {
		let section = Math.floor(Math.random() * NUMBER_OF_SECTIONS);
		if (section % 24 > 1 &&
			section % 25 > 1 &&
			Math.floor(section / 24) > 0 &&
			Math.floor(section / 24) < (FIELD_SIZE * 3 / 2 - 1) * 2 &&
			!isOccupied(room, section) &&
			!isOccupied(room, section - 1) &&
			!isOccupied(room, section + 1) &&
			!isOccupied(room, section - FIELD_SIZE * 2) &&
			!isOccupied(room, section + FIELD_SIZE * 2) &&
			!isOccupied(room, section - (FIELD_SIZE * 2 + Math.pow(-1, Math.floor(section / 24)))) &&
			!isOccupied(room, section + (FIELD_SIZE * 2 - Math.pow(-1, Math.floor(section / 24))))
		) {
			obsticles.push(section);
			room.occupiedSections.push(
				section,
				section - 1,
				section + 1,
				section - FIELD_SIZE * 2,
				section - (FIELD_SIZE * 2 + Math.pow(-1, Math.floor(section / 24))),
				section + FIELD_SIZE * 2,
				section + (FIELD_SIZE * 2 - Math.pow(-1, Math.floor(section / 24)))
			);
			count -= 1;
		}
	}
	return obsticles;
}

function generateMines(room) {
	let mines = [];
	let count = FIELD_SIZE;

	while (count > 0) {
		let section = Math.floor(Math.random() * NUMBER_OF_SECTIONS);
		if (!isOccupied(room, section)) {
			mines.push(section);
			room.occupiedSections.push(section);
			count -= 1;
		}
	}

	return mines;
}

function isOccupied(room, section) {
	return !!room.occupiedSections.find(item => {
		return section == item;
	})
}

http.listen(port, function() {
	console.log('listening on *:' + port);
});