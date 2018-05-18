let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let port = process.env.PORT || 3000;

app.use('/dist/app',express.static(__dirname + '/dist/app'));
app.use('/css',express.static(__dirname + '/css'));

app.use('/images',express.static(__dirname + '/images'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

const PLAYER_COLORS = ['#246EB9', '#4CB944', '#7F675B', '#4F517D', '#1A3A3A','#511730']
const FIELD_SIZE = 12;
const NUMBER_OF_SECTIONS = FIELD_SIZE*72;
const SHIP_POSITIONS = [0, 23, NUMBER_OF_SECTIONS/2 - 1, NUMBER_OF_SECTIONS/2 - 24, NUMBER_OF_SECTIONS - 24, NUMBER_OF_SECTIONS - 1];
const PLAYER_PROPS = {
	speed: 1,
	monitions: 3,
	life: 3,
	range: 1
};

const POWERUP_TYPES = ['speed', 'range', 'monitions', 'life'];
io.on('connection', function(socket){

	socket.on('add user', function (username) {
		let existingUser = getAllUsersData().find(user =>{ return user.username == username});
	  if(existingUser){
	  	socket.emit('taken username');
	  }else{
	  	socket.username = username;
		  socket.color = '#'+Math.random().toString(16).substr(2,6);
		 
		  socket.emit('logged in', getAllUsersData());
		  io.emit('new user', getAllUsersData());

		  socket.emit('rooms', getAllRoomsData());
		}
	});

	socket.on('join room', function (roomProps) {
		let room;
		if(io.sockets.adapter.rooms[roomProps.room]){
			room = io.sockets.adapter.rooms[roomProps.room];

			if(room.hasPass && room.pass !== roomProps.pass){
					socket.emit('wrong pass');
			}else{
				socket.join(roomProps.room);
				socket.emit('joined', {name: roomProps.room, type: room.type, admin: false});
			}
		}else{
			socket.join(roomProps.room);
			room = io.sockets.adapter.rooms[roomProps.room];
			room.name = roomProps.room;
			room.type = 'game';
			room.admin = socket.id;

			room.positions = [];
			room.occupiedSections = [];
			room.obsticles = generateObsticles(room);
			room.powerups = genreratePowerUps(room);
			//room.mines = generateMines(room);

			if(roomProps.pass != ''){
				room.hasPass = true;
				room.pass = roomProps.pass;
			}else{
				room.hasPass = false;
			}
			socket.emit('joined', {name: roomProps.room, type: room.type, admin: true});
		}

		if(room.type == 'game'){
			socket.room = roomProps.room;
			socket.props = Object.assign({}, PLAYER_PROPS);
			socket.color = PLAYER_COLORS[room.length -1];
			room.positions.push({position: SHIP_POSITIONS[room.length - 1], username: socket.username, color: socket.color});
		}

		io.emit('rooms', getAllRoomsData());
	});

	socket.on('leave room', function(){
		let room = io.sockets.adapter.rooms[socket.room];

		if(room.admin == socket.id){
			let sockets = Object.keys(room.sockets);

			io.to(socket.room).emit('close room', {
				message: createMessage( 
					' left and the room was lost. Please choose another room to play.', 
					socket, 
					true
				),
				room: room.name
			});

			sockets.forEach(socket =>{
				io.sockets.connected[socket].leave(socket.room);
			})
		}else{
			io.to(socket.room).emit('message', {
				message: createMessage(
					' left the room.', 
					socket,
					true
				), 
				room: socket.room
			});

			io.to(socket.room).emit('remove ship', socket.username);

			socket.emit('close room', {
				message: createMessage(' left ' + socket.room, socket, true),
				room: room.name				
			});
		}

		socket.leave(socket.room);
		socket.room = '';

		io.emit('rooms', getAllRoomsData());
	});

	socket.on('direct message', function(data){
		let roomName = socket.username + ' to ' + io.sockets.connected[data].username;
		if(io.sockets.adapter.rooms[roomName]){
			socket.emit('go to tab', roomName);
		}else{
			socket.join(roomName);
			let room = io.sockets.adapter.rooms[roomName];
			room.type = 'direct message';
			io.sockets.connected[data].join(roomName);
			
			socket.emit('joined', {name:roomName, type: room.type});
		}
	})

	socket.on('message to', function(data){
		let room = io.sockets.adapter.rooms[data.room];
		io.to(data.room).emit('message', {message: createMessage(data.text, socket), room: data.room});
	})

	socket.on('global message', function(text){
		io.emit('message',  {message: createMessage(text, socket)});
	});

	socket.on('canvas init', function(){
		let room = io.sockets.adapter.rooms[socket.room];
		socket.emit('init field', {size: FIELD_SIZE, powerups: room.powerups, obsticles: room.obsticles, occupied: room.occupiedSections});

		io.to(room.name).emit('positions', {positions: room.positions, props: PLAYER_PROPS});

		if(room.gameStarted){
			socket.emit('allow movement');
		}
	});

	socket.on('start game', function(){
		io.to(socket.room).emit('allow movement');
		let room = io.sockets.adapter.rooms[socket.room];
		room.gameStarted = true;

	});

	socket.on('move', function(start, end){
		socket.broadcast.to(socket.room).emit('new position', {start: start, end: end, name: socket.username});
	});

	socket.on('collect powerup', function(powerup){
		if(powerup.type == 'speed'){
			increaseSpeed(socket);
		}else if(powerup.type == 'range'){
			increaseRange(socket);
		}else	if(powerup.type == 'life'){
			increaseLife(socket);
		}else	if(powerup.type == 'monitions'){
			increaseMonitions(socket);
		}

		io.to(socket.room).emit('prop change', [generateProp(powerup.type, socket)]);

		let room = io.sockets.adapter.rooms[socket.room];

		let newPowerUp = createPowerUp(powerup.type, room);
		while(!newPowerUp){
			newPowerUp = createPowerUp(powerup.type, room);
		}

		room.powerups.splice(room.powerups.indexOf(powerup), 1, newPowerUp);
		room.occupiedSections.splice(room.occupiedSections.indexOf(powerup.section), 1, newPowerUp.section);

		setTimeout(()=>{
			io.to(socket.room).emit('add powerup', newPowerUp);
		}, 30000);
	});

	socket.on('hit', function(data){
		if(socket.props.monitions > 0){
			let target = getSocketByUsername(data);
			if(target.props.life > 0){
				decreaseMonitions(socket);
				decreaseLife(target);
				io.to(socket.room).emit('prop change', [generateProp('monitions', socket), generateProp('life', target)]);
				if(target.props.life == 0){
					io.to(socket.room).emit('player sunk', data);

					let alivePlayers = getAlivePlayers(io.sockets.adapter.rooms[socket.room]);
					if(alivePlayers.length == 1){
						io.to(socket.room).emit('game over', socket.username);
							let room = io.sockets.adapter.rooms[socket.room];
							room.gameStarted = false;
					}
				}
			}
		}
	});

	socket.on('play again', function(){
		let room = io.sockets.adapter.rooms[socket.room];
		socket.emit('joined', {name: socket.room, type: room.type, admin: socket.username == room.admin ? true : false})
	})

	socket.on('disconect', function(){
		io.emit('get users', getAllUsersData());
	});
});

function getAlivePlayers(room){
	let keys = Object.keys(room.sockets);
	let usersData = [];

	keys.forEach(function(key) {
		let socket = io.sockets.sockets[key];
		if(socket.props.life > 0){
			usersData.push(key)
		}
	});
	return usersData;
}

function getAllUsersData(){
	let keys = Object.keys(io.sockets.sockets);
	let usersData = [];

	keys.forEach(function(key) {
		let socket = io.sockets.sockets[key];
		if(socket.username){
			usersData.push({
				username: socket.username,
				id: socket.id
			})
		}
	});
	return usersData;
}

function getSocketByUsername(name){
	let keys = Object.keys(io.sockets.sockets);

	let socket = io.sockets.sockets[keys.find(function(key) {
		return io.sockets.sockets[key].username == name;
	})];
	return socket;
}

function getAllRoomsData(){
	let keys = Object.keys(io.sockets.adapter.rooms);
	let roomsData = [];

	keys.forEach(function(key) {
		let room = io.sockets.adapter.rooms[key];
		if(room.name && room.type == 'game'){
			roomsData.push({
				name: room.name,
				hasPass: room.hasPass,
				length: room.length,
				key: key
			})
		}
	});
	return roomsData;
}

function createMessage(text, sender, isAdminMessage = false){
	return {
		sender: {
			name: sender.username,
			color: sender.color
		},
		text: text,
		time: formatTime(new Date()),
		isAdminMessage: isAdminMessage
	}
}

function formatTime(date){
	return date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
}

function increaseSpeed(socket){
	socket.props.speed +=1;
}

function resetSpeed(socket){
	socket.props.speed = 1;
}

function decreaseLife(socket){
	socket.props.life -=1;
}

function increaseLife(socket){
	if(socket.props.life < 3){
		socket.props.life +=1;
	}
}

function increaseRange(socket){
	socket.props.range +=1;
}

function resetRange(socket){
	socket.props.range = 3;
}

function increaseMonitions(socket){
	socket.props.monitions += 3;
}

function decreaseMonitions(socket){
	socket.props.monitions -=1;
}

function generateProp(powerup, socket){
	return { 
		powerup: powerup, 
		amount: socket.props[powerup], 
		username: socket.username 
	};
}

function genreratePowerUps(room){
	let powerUps = [];
	let count = POWERUP_TYPES.length*FIELD_SIZE/2;

	while(count > 0){
		let type = POWERUP_TYPES[count%POWERUP_TYPES.length];
		let powerup = createPowerUp(type, room);
		if(powerup){
			powerUps.push(powerup);
			room.occupiedSections.push(powerup.section);
			count -=1;
		}
	}

	return powerUps;
}

function createPowerUp(type, room){
	let section = Math.floor(Math.random()*NUMBER_OF_SECTIONS);

	if(!isOccupied(room, section)){
		return {
			section: section, 
			type : type
		}
	}
}

function generateObsticles(room){
	let obsticles = [];
	let count = Math.max(6, Math.floor(Math.random()*FIELD_SIZE));
	while(count > 0){
		let section =  Math.floor(Math.random()*NUMBER_OF_SECTIONS);
		if(section%24 > 1 && 
			section%25 > 1 && 
			Math.floor(section/24) > 0 && 
			Math.floor(section/24) < (FIELD_SIZE*3/2 -1)*2 && 
			!isOccupied(room, section) &&
			!isOccupied(room, section - 1) &&
			!isOccupied(room, section + 1) &&
			!isOccupied(room, section - FIELD_SIZE*2) &&
			!isOccupied(room, section + FIELD_SIZE*2) &&
			!isOccupied(room, section - (FIELD_SIZE*2 + Math.pow(-1, Math.floor(section/24)))) &&
			!isOccupied(room, section + (FIELD_SIZE*2 - Math.pow(-1, Math.floor(section/24))))
			){
			obsticles.push(section);
				room.occupiedSections.push(
				section,  
				section - 1, 
				section + 1, 
				section - FIELD_SIZE*2, 
				section - (FIELD_SIZE*2 + Math.pow(-1, Math.floor(section/24))), 
				section + FIELD_SIZE*2, 
				section + (FIELD_SIZE*2 - Math.pow(-1, Math.floor(section/24)))
			);
			count -=1;
		}
	}
	return obsticles;
}

function generateMines(room){
	let mines = [];
	let count = 30;

	while(count > 0){
		let section = Math.floor(Math.random()*NUMBER_OF_SECTIONS);
		if(!isOccupied(room, section)){
			mines.push(section);
			room.occupiedSections.push(section);
			count -=1;
		}
	}

	return mines;
}

function isOccupied(room, section){
	return !!room.occupiedSections.find(item =>{
		return section == item;
	})
}
http.listen(port, function(){
  console.log('listening on *:' + port);
});
