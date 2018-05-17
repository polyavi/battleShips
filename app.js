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
const NUMBER_OF_SECTIONS = 469;
const SHIP_POSITIONS = [
	{
		x: FIELD_SIZE*76,
		y: FIELD_SIZE*44
	},
	{
		x: -FIELD_SIZE*76,
		y: -FIELD_SIZE*44
	},
	{
		x: FIELD_SIZE*76,
		y: -FIELD_SIZE*44
	},
	{
		x: -FIELD_SIZE*76,
		y: FIELD_SIZE*44
	},
	{
		x: 0,
		y: FIELD_SIZE*87
	},
	{
		x: 0,
		y: -FIELD_SIZE*87
	}
];
const PLAYER_PROPS = {
	speed: 1,
	monitions: 10,
	life: 3,
	range: 3
};

const POWERUP_TYPES = ['speed', 'range', 'monitions', 'life'];

io.on('connection', function(socket){

	socket.on('add user', function (username) {
	  socket.username = username;
	  socket.color = '#'+Math.random().toString(16).substr(2,6);
	 
	  io.emit('new user', getAllUsersData());

	  socket.emit('rooms', getAllRoomsData());
	});

	socket.on('join room', function (roomProps) {
		let room;
		if(io.sockets.adapter.rooms[roomProps.room]){
			room = io.sockets.adapter.rooms[roomProps.room];

			if(room.hasPass && room.pass !== roomProps.pass){
					socket.emit('wrong pass');
			}else{
				socket.emit('joined', {name: roomProps.room, type:room.type, admin: false});
				socket.join(roomProps.room);
			}
		}else{
			socket.join(roomProps.room);

			room = io.sockets.adapter.rooms[roomProps.room];
			room.name = roomProps.room;
			room.type = 'game';
			room.positions = [];
			room.admin = socket.id;
			room.powerups = genreratePowerUps();

			if(roomProps.pass != ''){
				room.hasPass = true;
				room.pass = roomProps.pass;
			}else{
				room.hasPass = false;
			}

			socket.emit('joined', {name: roomProps.room, type: room.type, admin: true});
		}

		if(room.type = 'game'){
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
		console.log(data);
		let room = socket.username + ' to ' + io.sockets.connected[data].username;
		if(io.sockets.adapter.rooms[room]){
			socket.emit('go to tab', room);
		}else{
			socket.join(room);
			io.sockets.connected[data].join(room);
			io.sockets.adapter.rooms[room].type = 'direct message';
			socket.emit('joined', {name: room, type:room.type});
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
		socket.emit('init field', {size: FIELD_SIZE, powerups: room.powerups});

		io.to(room.name).emit('positions', {positions: room.positions, props: PLAYER_PROPS})
	});

	socket.on('start game', function(){
		io.to(socket.room).emit('allow movement');
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
			fillLife(socket);
		}else	if(powerup.type == 'monitions'){
			increaseMonitions(socket);
		}

		io.to(socket.room).emit('prop change', [generateProp(powerup.type, socket)]);

		socket.broadcast.to(socket.room).emit('remove powerup', powerup);
		let room = io.sockets.adapter.rooms[socket.room]

		let newPowerUp = createPowerUp(powerup.type, room.powerups);

		room.powerups.splice(room.powerups.indexOf(powerup), 1, newPowerUp);

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

function fillLife(socket){
	socket.props.life = 3;
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

function genreratePowerUps(){
	let powerUps = [];
	let count = POWERUP_TYPES.length*FIELD_SIZE;

	for(count; count > 0; count -=1){
		powerUps.push(
			createPowerUp(POWERUP_TYPES[Math.ceil(count/FIELD_SIZE) - 1], powerUps)
		);
	}

	return powerUps;
}

function createPowerUp(type, powerups){
	let index = Math.floor(Math.random()*NUMBER_OF_SECTIONS);
	let isOccupied = !!powerups.find(powerup =>{
		return powerup.section == index;
	})
	while(isOccupied){
		index = Math.floor(Math.random()*NUMBER_OF_SECTIONS);
		isOccupied = !!powerups.find(powerup =>{
			return powerup.section == index;
		})
	}
	return {
		section: index, 
		type : type
	}
}

http.listen(port, function(){
  console.log('listening on *:' + port);
});
