var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var userCount = 0;
var pairs = [];
var prevUser;

app.use('/js',express.static(__dirname + '/js'));
app.use('/css',express.static(__dirname + '/css'));

app.use('/images',express.static(__dirname + '/images'));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	var addedUser = false;

  // when the client emits 'add user', this listens and executes
	socket.on('add user', function (username) {
	  if (addedUser) return;
	  socket.username = username;
	  userCount +=1;
	  addedUser = true;
	 
	  if(userCount%2 != 0){
	  	prevUser = socket;
	  }else{
	  	pairs.push([prevUser.id, socket.id]);
	  	socket.broadcast.to(prevUser.id).emit('user joined', socket.username);
	  	socket.emit('login', prevUser.username);
	  }
	});

	socket.on('start game', function(data){
		socket.broadcast.to(getOponentId(socket.id)).emit('receive position', data);
	});

	socket.on('hit', function(section){
		socket.broadcast.to(getOponentId(socket.id)).emit('get hit', section);
	});
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

http.listen(port, function(){
  console.log('listening on *:' + port);
});
