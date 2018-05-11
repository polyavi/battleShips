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

io.on('connection', function(socket){

	socket.on('add user', function (username) {
	  socket.username = username;
	  socket.color = '#'+Math.random().toString(16).substr(2,6);
	 
	  io.emit('new user', getAllUsersData());
	  socket.emit('rooms', getAllRoomsData());
	});

	socket.on('join room', function (roomProps) {
		if(io.sockets.adapter.rooms[roomProps.room]){
			let room = io.sockets.adapter.rooms[roomProps.room];
			if(room.hasPass && room.pass !== roomProps.pass){
					socket.emit('wrong pass');
			}else{
				socket.emit('joined', roomProps.room);
				socket.join(roomProps.room);
			}
		}else{
			socket.join(roomProps.room);
			socket.emit('joined', roomProps.room);

			let room = io.sockets.adapter.rooms[roomProps.room];
			room.name = roomProps.room;
			if(roomProps.pass != ''){
				room.hasPass = true;
				room.pass = roomProps.pass;
			}else{
				room.hasPass = false;
			}
		}
		io.emit('rooms', getAllRoomsData());
	});

	socket.on('message to', function(data){
		io.to(data.room).emit('message', {message: createMessage(data.text, socket), room: data.room});
	})

	socket.on('global message', function(text){
		io.emit('message',  {message: createMessage(text, socket)});
	})

	socket.on('invite', function (username) { 
	  io.emit('invitation', {username, room});
	});

	socket.on('start game', function(data){
		socket.broadcast.to(getOponentId(socket.id)).emit('receive position', data);
	});

	socket.on('disconect', function(){
		io.emit('get users', getAllUsersData());
	});
});

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

function getAllRoomsData(){
	let keys = Object.keys(io.sockets.adapter.rooms);
	let roomsData = [];

	keys.forEach(function(key) {
		let room = io.sockets.adapter.rooms[key];
		if(room.name){
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

function createMessage(text, sender){
	return {
		sender: {
			name: sender.username,
			color: sender.color
		},
		text: text,
		time: formatTime(new Date())
	}
}
function formatTime(date){
	return date.getHours() + ':' + date.getMinutes();
}
http.listen(port, function(){
  console.log('listening on *:' + port);
});
