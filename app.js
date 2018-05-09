let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let port = process.env.PORT || 3000;

let pairs = [];
let prevUser;

app.use('/dist/app',express.static(__dirname + '/dist/app'));
app.use('/css',express.static(__dirname + '/css'));

app.use('/images',express.static(__dirname + '/images'));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  // when the client emits 'add user', this listens and executes
	socket.on('add user', function (username) {
	  socket.username = username;
	 
	  io.emit('get users', getAllUsersData());
	});

	socket.on('start game', function(data){
		socket.broadcast.to(getOponentId(socket.id)).emit('receive position', data);
	});

	socket.on('hit', function(section){
		socket.broadcast.to(getOponentId(socket.id)).emit('get hit', section);
	});

	socket.on('pair', function(userId){
		createPair([userId, socket.id]);
		socket.broadcast.to(userId).emit('pair request', {id: socket.id, username: socket.username});
	});

	socket.on('accept', function(userId){
		socket.broadcast.to(userId).emit('accepted', socket.username);
		io.emit('get users', getAllUsersData());
	});

	socket.on('decline', function(userId){
		socket.broadcast.to(userId).emit('declined', socket.username);
		removePair([userId, socket.id]);
	});

	socket.on('disconect', function(){
		io.emit('get users', getAllUsersData());
	})
});

function getOponentId(id){
	let oponentID;
	pairs.forEach(pair =>{
		if(pair[0] == id){
			oponentID = pair[1];
		}
		else if(pair[1] == id){
			oponentID = pair[0];
		}
	});
	return oponentID;
}

function getAllUsersData(){
	let keys = Object.keys(io.sockets.sockets);
	let usersData = [];

	keys.forEach(function(key) {
		let socket = io.sockets.sockets[key];
		if(socket.username){
			usersData.push({
				username: socket.username,
				id: socket.id,
				paired: socket.paired
			})
		}
	});
	return usersData;
}

function createPair(arrOfIds){
	pairs.push(arrOfIds);
	arrOfIds.forEach( function(id) {
		io.sockets.connected[id].paired = true;
	});
}

function removePair(pairToRemove){
	pairToRemove.forEach( function(id) {
		io.sockets.connected[id].paired = false;
	});
	pairs = pairs.filter((pair) => pair[0] != pairToRemove[0] && pair[1] != pairToRemove[1]);
}


http.listen(port, function(){
  console.log('listening on *:' + port);
});
