import store from '../store/store';
import Init from '../components/canvasActions/Init'
import gameActions from '../actions/gameActions';
import roomsActions from '../actions/roomActions';
import userActions from '../actions/userActions';
import chatActions from '../actions/chatActions';

export default function() {
	window.socket.on('new user', (data) => {
		store.dispatch(userActions.addUser(data));
	});

	window.socket.on('remove user', (userId) => {
		store.dispatch(chatActions.hideChatTab(store.getState().userData.users.find(user => user.id == userId).username))
		store.dispatch(userActions.removeUser(userId));
	});

	window.socket.on('logged in', (data) => {
		store.dispatch(userActions.setUsers({users: data.allUsers,
			me: {
				name: data.username,
				id: data.id
			}
		}));
		store.dispatch(roomsActions.setRooms(data.allRooms));
	});

	window.socket.on('created room', (data) => {
		store.dispatch(roomsActions.addRoom({
			id: data.roomId,
			name: data.name,
			hasPass: data.hasPass,
			type: data.type,
			length: 1
		}));
		store.dispatch(gameActions.createConnection({
			roomId: data.roomId,
			isAdmin: data.admin
		}));
		store.dispatch(gameActions.setGame());
		store.dispatch(chatActions.toggleChat(true));
		store.dispatch(chatActions.addChatTab(data.name));
	});

	window.socket.on('joined room', (data) => {
		store.dispatch(gameActions.createConnection({
			roomId: data.roomId,
			isAdmin: data.admin
		}));

		store.dispatch(roomsActions.changeRoom({roomId: data.roomId, length: data.length}));
  	store.dispatch(gameActions.setGame());

		store.dispatch(chatActions.toggleChat(true));
		store.dispatch(chatActions.addChatTab(store.getState().rooms.find(room => room.id == data.roomId).name));
	});

	window.socket.on('new room', (data) => {
		store.dispatch(roomsActions.addRoom({
			id: data.roomId,
			name: data.name,
			hasPass: data.hasPass,
			type: data.type,
			length: 1
		}));
	});

	window.socket.on('removed room', (roomId) => {
	  store.dispatch(chatActions.hideChatTab(store.getState().rooms.find(room => room.id == roomId).name));

	  store.dispatch(roomsActions.removeRoom(roomId));
  });

  window.socket.on('message', (message) => {
		if (!store.getState().chat.chatTabs.find(item => message.to == item.name)) {
    	store.dispatch(chatActions.addChatTab(message.to));
    }else{
    	store.dispatch(chatActions.showChatTab(message.to));
    }
    if(message.to != store.getState().chat.activeChat){
	    store.dispatch(chatActions.addPendingTab(message.to));
	  }
    store.dispatch(chatActions.addMessage(message, false));
  });

  window.socket.on('system message', (message) => {
  	if(message.to != store.getState().chat.activeChat){
	    store.dispatch(chatActions.addPendingTab(message.to, true));
	  }
	  store.dispatch(chatActions.showChatTab(message.to));
    store.dispatch(chatActions.addMessage(message, true));
  });

  window.socket.on('allow movement', () => {
  	store.dispatch(gameActions.startGame());
  })

  window.socket.on('game over', (username) => {
  	let me = store.getState().userData.me.name;
  	if(me == username) {
  		store.dispatch(gameActions.finishGame(true));
  	} else {
  		store.dispatch(gameActions.finishGame(false));
  	}
  })

  window.socket.on('restart', () => {
  	window.bts.delete;
  	Init();
  	window.bts.me = store.getState().userData.me.name;
  	store.dispatch(gameActions.setGame());
  })

  window.socket.on('close room', () => {
  	let length = store.getState().rooms.find(room => room.id == store.getState().game.connectedRoom).length;
  	store.dispatch(roomsActions.changeRoom({roomId: store.getState().game.connectedRoom, length: length - 1}));
  });
}