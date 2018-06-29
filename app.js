let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let port = process.env.PORT || 3000;

app.use('/dist/app', express.static(__dirname + '/dist/app'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/images', express.static(__dirname + '/images'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use(redirectUnmatched);

function redirectUnmatched(req, res) {
	res.redirect('/');
}

const FIELD_SIZE = 12;
const NUMBER_OF_SECTIONS = FIELD_SIZE * 72;
const SHIP_POSITIONS = [0, FIELD_SIZE * 2 - 1, NUMBER_OF_SECTIONS / 2 - 1, NUMBER_OF_SECTIONS / 2 - FIELD_SIZE * 2, NUMBER_OF_SECTIONS - FIELD_SIZE * 2, NUMBER_OF_SECTIONS - 1];
const POWERUP_TYPES = ['speed', 'range', 'monitions', 'life'];
const PLAYER_PROPS = {
	speed: Math.floor(FIELD_SIZE / 12),
	monitions: 3,
	life: 3,
	range: Math.floor(FIELD_SIZE / 12)
};
/**
 * Creates listeners for all user queries
 *
 * @param {Object} socket data for the connected user 
 */

io.on('connection', function (socket) {

	socket.on('add user', function (username) {
		console.log(socket.conn.remoteAddress);
		addNewUser(socket, username);
	});

	socket.on('join room', function (roomProps) {
		if (socket) logInExistingRoom(roomProps, socket);
	});

	socket.on('create room', function (roomProps) {
		createNewRoom(roomProps, socket);
	});

	socket.on('remove room', function () {
		if (socket) removeRoom(socket);
	});

	socket.on('leave room', function () {
		leaveRoom(socket);
	});

	socket.on('direct message', function ({
		text,
		name
	}) {
		if (socket) sendDirectMessage(socket, text, name);
	});

	socket.on('global message', function (text) {
		if (socket) io.emit('message', createMessage(text, socket, 'global'));
	});

	socket.on('canvas init', function () {
		if (socket) initField(socket);
	});

	socket.on('start game', function () {
		if (socket) startGame(socket);
	});

	socket.on('move', function (start, end) {
		if (socket) sendNewPosition(socket, start, end);
	});

	socket.on('collect powerup', function (powerup) {
		collectPowerUp(socket, powerup);
	});

	socket.on('steped on mine', function () {
		if (socket) resetStats(socket);
	});

	socket.on('hit', function (data) {
		initiateHitEvents(socket, data);
	});

	socket.on('play again', function () {
		if (socket) restartGame(socket);
	});

	socket.on('disconnect', function () {
		if (socket) {
			io.emit('remove user', socket.id);
			removeRoom(socket);
		}
	});
});

/**
 * Checks if the username already exists, if not asigns it to the socket 
 * and sends message to all users with the data of the new one
 *
 * @method addNewUser
 * @param {Object} socket
 */
function addNewUser(socket, username) {
	if (socket) {
		let existingUser = getAllUsersData().find(user => {
			return user.username == username;
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
	}
}

/**
 * Connects the socket, creates the room and sends message to all sockets
 * with the data for the new room
 *
 * @method createNewRoom
 * @param {Object}  roomProps 
 * @param {Object}  socket 
 */
function createNewRoom(roomProps, socket) {
	if (socket) {
		socket.join(roomProps.room);
		let room = io.sockets.adapter.rooms[roomProps.room];
		if (room) {
			setRoom(roomProps, socket, room);

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
		}
	}
}

/**
 * Sets initial data for the new room, field
 * and its administrator
 *
 * @method setRoom
 * @param {String}  roomname 
 * @param {String} password 
 * @param {Object} socket 
 */
function setRoom(roomInpit, socket, room) {

	room.name = roomInpit.room;
	room.admin = socket.id;
	room.id = room.name + socket.id;

	if (roomInpit.pass != '') {
		room.hasPass = true;
		room.pass = roomInpit.pass;
	} else {
		room.hasPass = false;
	}
	setFieldProps(room);
	setNewPlayer(socket, room);
}

/**
 * Disconnects socket from room and sends message to the room
 * that the user has left
 *
 * @method leaveRoom
 * @param {Object} socket 
 */
function leaveRoom(socket) {
	if (socket) {
		let room = io.sockets.adapter.rooms[socket.room];
		if (room) {
			socket.to(socket.room).emit('system message', createMessage(
				' left the game.',
				socket,
				socket.room
			));

			io.to(socket.room).emit('remove ship', socket.username);

			socket.emit('close room', {
				id: room.id,
				length: room.length - 1
			});
			socket.broadcast.emit('room change', {
				id: room.id,
				length: room.length - 1
			});
			socket.emit('system message', createMessage(' left ' + socket.room, socket, 'global'));

			socket.leave(socket.room);
			socket.room = '';

			socket.to(room.name).emit('change room length', room.length);
			io.emit('rooms', getAllRoomsData());
		}
	}
}

/**
 * Sends message and disconnects all sockets in the room
 * and its administrator
 *
 * @method removeRoom
 * @param {Object} socket 
 */
function removeRoom(socket) {
	if (socket) {
		let room = io.sockets.adapter.rooms[socket.room];
		if (room) {
			let sockets = Object.keys(room.sockets);

			io.to(socket.room).emit('system message', createMessage(
				' left and the room was lost. Please choose another room to play.',
				socket,
				'global'
			));

			sockets.forEach(id => {
				io.sockets.sockets[id].leave(room.name);
				io.sockets.sockets[id].room = '';
			});

			io.emit('removed room', room.id);
		}
	}
}

/**
 * @method getAllRoomsData
 * @return {Array} the relevant data for all rooms
 */
function getAllRoomsData() {
	let keys = Object.keys(io.sockets.adapter.rooms);
	let roomsData = [];

	keys.forEach(function (key) {
		let room = io.sockets.adapter.rooms[key];
		if (room.name && room.length != 0) {
			roomsData.push({
				name: room.name,
				hasPass: room.hasPass,
				length: room.length,
				id: room.id
			});
		}
	});
	return roomsData;
}

/**
 * Checks if the pass is correct, connects the socket and sets the new player data
 *
 * @method logInExistingRoom 
 * @param {String} password 
 * @param {Object} socket 
 */
function logInExistingRoom(roomProps, socket) {
	let room = io.sockets.adapter.rooms[roomProps.room];
	if (room && room.hasPass && room.pass !== roomProps.pass && room.length <= 6) {
		socket.emit('wrong pass');
	} else {
		socket.join(room.name);

		socket.emit('joined room', {
			userId: socket.id,
			roomId: room.id,
			length: room.length,
			admin: false
		});

		io.to(room.name).emit('change room length', room.length);

		socket.to(room.name).emit('system message', createMessage(
			' joined the game.',
			socket,
			room.name
		));

		setNewPlayer(socket, room);
	}
}

/**
 * @method getAllUsersData 
 * @return {Array} the relevant data for all sockets/users
 */
function getAllUsersData() {
	let keys = Object.keys(io.sockets.sockets);
	let usersData = [];

	keys.forEach(function (key) {
		let socket = io.sockets.sockets[key];
		if (socket.username) {
			usersData.push({
				username: socket.username,
				id: socket.id,
				color: socket.color
			});
		}
	});
	return usersData;
}

/**
 * @method getSocketByUsername 
 * @param {String} name 
 * @return {Object} socket
 */
function getSocketByUsername(name) {
	let keys = Object.keys(io.sockets.sockets);

	let socket = io.sockets.sockets[keys.find(function (key) {
		return io.sockets.sockets[key].username == name;
	})];
	return socket;
}

/**
 * @method sendDirectMessage 
 * @param {Object} socket Sender data
 * @param {String} text
 * @param {String} name The receiver name
 */
function sendDirectMessage(socket, text, name) {
	let reciever = getSocketByUsername(name);
	if (reciever) {
		io.to(reciever.id).emit('message', createMessage(text, socket, socket.username));
		socket.emit('message', createMessage(text, socket, name));
	} else {
		io.to(name).emit('message', createMessage(text, socket, name));
	}
}

/**
 * @method createMessage 
 * @param {String} text 
 * @return {Object} sender
 * @param {String} receiver The name of the user or room to receive the message
 * @return {Object} message object containing the sender info, text, time and receiver
 */
function createMessage(text, sender, receiver) {
	return {
		sender: {
			name: sender.username,
			color: sender.color
		},
		to: receiver,
		text: text,
		time: formatTime(new Date())
	};
}

/**
 * @method formatTime 
 * @param {Date} date
 * @return {String} the formated hh:mm time  
 */
function formatTime(date) {
	return date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
}

// game logic methods
/**
 * Sends all the data for the field: mines, powerups, islands and position of ships to the socket
 * 
 * @method initField 
 * @param {Object} socket 
 */
function initField(socket) {
	let room = io.sockets.adapter.rooms[socket.room];
	if (room) {
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
}

/**
 * generates all the data for the field: mines, powerups, islands
 *
 * @method setFieldProps 
 * @param {Object} room 
 */
function setFieldProps(room) {
	room.availablePositions = getRandomizedShipPostions();
	room.occupiedShipPositions = [];
	room.positions = [];
	room.occupiedSections = [];
	room.alivePlayers = 0;
	room.obsticles = generateObsticles(room);
	room.powerups = generatePowerUps(room);
	room.mines = generateMines(room);
}

/**
 * Sets new player position and stats
 *
 * @method setNewPlayer 
 * @param {Object} socket 
 * @param {Object} room 
 */
function setNewPlayer(socket, room) {
	socket.room = room.name;
	socket.props = Object.assign({}, PLAYER_PROPS);
	room.positions.push({
		position: room.availablePositions[room.length - 1],
		username: socket.username,
		color: socket.color
	});
	room.alivePlayers += 1;
}

/**
 * Sets the game to started and sends message to the players
 *
 * @method startGame 
 * @param {Object} socket 
 */
function startGame(socket) {
	if (socket) {
		let room = io.sockets.adapter.rooms[socket.room];
		if (room && room.length > 1) {
			io.to(socket.room).emit('allow movement');
			room.gameStarted = true;

			io.to(socket.room).emit('system message', createMessage(' started the game.', socket, socket.room));
		}
	}
}

/**
 * Sends the new position of the moved ship to the other players
 *
 * @method sendNewPosition 
 * @param {Object} socket
 * @param {Object} start
 * @param {Object} end 
 */
function sendNewPosition(socket, start, end) {
	socket.broadcast.to(socket.room).emit('new position', {
		start: start,
		end: end,
		name: socket.username
	});
}

/**
 * Changes player stats according to the collected powerup
 * and sends message to all players with the changed props
 *
 * @method collectPowerUp 
 * @param {Object} socket
 * @param {Object} powerup
 */
function collectPowerUp(socket, powerup) {
	if (socket && socket.props) {
		if (powerup.type == 'speed') {
			socket.props.speed += 1;
		} else if (powerup.type == 'range') {
			socket.props.range += 1;
		} else if (powerup.type == 'life') {
			socket.props.life += 1;
		} else if (powerup.type == 'monitions') {
			socket.props.monitions += 1;
		}

		io.to(socket.room).emit('prop change', {
			props: [generateProp(powerup.type, socket)]
		});

		let room = io.sockets.adapter.rooms[socket.room];
		if (room) {
			io.to(room.name).emit('remove powerup', powerup);

			io.to(room.name).emit('system message', createMessage(' collected ' + powerup.type + ' power up.', socket, room.name));
			replacePowerup(powerup, room, socket);
		}
	}
}

/**
 * Replaces the old power up with new one on different position
 * and sends message with the new powerup after 5 seconds
 *
 * @method replacePowerup 
 * @param {Object} powerup
 * @param {Object} room
 * @param {Object} socket
 */
function replacePowerup(powerup, room, socket) {
	let newPowerUp = createPowerUp(powerup.type, room);
	while (!newPowerUp) {
		newPowerUp = createPowerUp(powerup.type, room);
	}

	room.powerups.splice(room.powerups.indexOf(powerup), 1, newPowerUp);
	room.occupiedSections.splice(room.occupiedSections.indexOf(powerup.section), 1, newPowerUp.section);

	setTimeout(() => {
		io.to(socket.room).emit('add powerup', newPowerUp);
	}, 5000);
}

/**
 * Reduces life, sends message to players and checks if player is out of lifes and if so calls sinkShip
 *
 * @method initiateHitEvents 
 * @param {Object} socket
 * @param {Object} data
 */
function initiateHitEvents(socket, data) {
	if (socket && socket.props && socket.props.monitions > 0) {
		let target = getSocketByUsername(data.name);
		if (target.props.life > 0) {
			socket.props.monitions -= 1;
			target.props.life -= 1;

			io.to(socket.room).emit('prop change', {
				props: [generateProp('monitions', socket), generateProp('life', target)],
			});

			if (target.props.life == 0) {
				sinkShip(socket, data.name);
			} else {
				io.to(socket.room).emit('system message', createMessage(
					' atacked ' + data.name + ' and lost life.',
					socket,
					socket.room
				));
			}
		}
	}
}
/**
 * Resets thee speed and range stats and sends message to players
 *
 * @method resetStats 
 * @param {Object} socket
 */
function resetStats(socket) {
	socket.props.range = PLAYER_PROPS.range;
	socket.props.speed = PLAYER_PROPS.speed;
	socket.props.life -= 1;

	io.to(socket.room).emit('prop change', {
		props: [generateProp('speed', socket), generateProp('range', socket), generateProp('life', socket)]
	});

	io.to(socket.room).emit('system message', createMessage(
		' steped on mine and lost all speed and range enhansments.',
		socket,
		socket.room
	));

}

/**
 * Sends messages to the players of sunk ships and end of game
 *
 * @method sinkShip 
 * @param {Object} attacker 
 * @param {String} attacked 
 */
function sinkShip(attacker, attacked) {
	let room = io.sockets.adapter.rooms[attacker.room];
	if (room) {
		room.alivePlayers -= 1;
		io.to(attacker.room).emit('player sunk', attacked);
		if (room.alivePlayers == 1) {
			io.to(attacker.room).emit('game over', attacker.username);
			room.restart = false;
			room.gameStarted = false;
		} else {
			io.to(attacker.room).emit('system message', createMessage(
				' atacked ' + attacked + ' and sunk their ship.',
				attacker,
				room.name
			));
		}
	}
}

/**
 * Resets all field and player data and sends field redraw event to the player
 *
 * @method restartGame 
 * @param {Object} socket
 */
function restartGame(socket) {
	let room = io.sockets.adapter.rooms[socket.room];
	if (room) {
		if (!room.restart) {
			room.restart = true;
			setFieldProps(room);
			initField(socket);
		}
		setNewPlayer(socket, room);

		socket.emit('restart', socket.room);
	}
}

/**
 * Randomizes posible positions of ships
 *
 * @method getRandomizedShipPostions 
 * @return {Array}  Array of posible postions for ships
 * 
 */
function getRandomizedShipPostions() {
	let initialPositions = SHIP_POSITIONS.slice();
	let randomizedPositions = [];
	while(initialPositions.length > 0){
		let index = Math.floor(Math.random() * initialPositions.length);
		randomizedPositions.push(initialPositions[index]);
		initialPositions.splice(index,1);
	}
	return randomizedPositions;
}
/**
 * @method generateProp 
 * @param {String} powerup 
 * @param {Object} socket 
 * @return {Object} prop change data to be send to the players
 */
function generateProp(powerup, socket) {
	return {
		powerup: powerup,
		amount: socket.props[powerup],
		username: socket.username
	};
}

/**
 * @method generatePowerUps 
 * @param {Object} room 
 * @return {Array} the indexes of the sections containig powerups and the type of powerup 
 */
function generatePowerUps(room) {
	let powerUps = [];
	let count = POWERUP_TYPES.length * FIELD_SIZE;

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

/**
 * @method createPowerUp 
 * @param {String} type The type of powerup to be created 
 * @param {Object} room 
 * @return {Object} powerup data
 */
function createPowerUp(type, room) {
	let section = Math.floor(Math.random() * NUMBER_OF_SECTIONS);

	if (!isOccupied(room, section)) {
		return {
			section: section,
			type: type
		};
	}
}

/**
 * @method generateObsticles 
 * @param {Object} room 
 * @return {Array} The indexes of the sections containig islands 
 */
function generateObsticles(room) {
	let obsticles = [];
	let count = Math.max(6, Math.floor(Math.random() * FIELD_SIZE * 3));
	while (count > 0) {
		let section = Math.floor(Math.random() * NUMBER_OF_SECTIONS);
		if (!isOccupied(room, section)) {
			obsticles.push(section);
			count -= 1;
		}
	}
	return obsticles;
}

/**
 * @method generateMines 
 * @param {Object} room 
 * @return {Array} The indexes of the sections containig mines 
 */
function generateMines(room) {
	let mines = [];
	let count = FIELD_SIZE * 2;

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
/**
 * @method isOccupied 
 * @param {Object} room 
 * @param {Number} section 
 * @return {Boolean} Does the section contain mine, powerup or island
 */
function isOccupied(room, section) {
	return !!room.occupiedSections.find(item => {
		return section == item;
	});
}

http.listen(port, function () {
	console.log('listening on *:' + port);
});