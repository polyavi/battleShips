import React, { Component } from 'react';
import Game from './Game';
import JoinRoom from './JoinRoom';
import Chat from './Chat';
import Login from './Login'
import RoomList from './RoomList'


class Main extends Component {
  constructor(props){
    super(props);

    this.state = {
      room: '',
      password: ''
    }

    this.handleLogIn = this.handleLogIn.bind(this);
    this.setUsername = this.setUsername.bind(this);
    this.handleJoinRoom = this.handleJoinRoom.bind(this);

    this.props.socket.on('wrong pass', ()=>{
    	this.props.showJoinRoom(true);
    })
  }

  handleLogIn = (username) => {
    if(username != "")
    {
      this.props.logIn(username);
      this.setUsername(username);
    }
  }

  setUsername (username) {
    this.props.socket.emit('add user', username);
  }

  handleJoinRoom (room, pass){
  	this.setState({room: room, password: pass});
  	this.props.socket.emit('join room', {room, pass});
  }

  render() {
    return (
      <main>
          {this.props.screen == 'log in' && 
          	<Login onSubmit={this.handleLogIn} />}
        	<RoomList 
        		screen={this.props.screen}
        		socket={this.props.socket}
        		showJoinRoom={this.props.showJoinRoom}
        	/>
          {(this.props.screen == 'join room' || this.props.screen == 'create room') && 
          	<JoinRoom 
          		onSubmit={this.handleJoinRoom} 
          		screen={this.props.screen}
          		wrongPass={this.props.wrongPass}
          		room={this.state.room}/>
          }
          {this.props.screen == 'game' && 
          	<Game socket={this.props.socket}
          		screen={this.props.screen}
          		me={this.props.me} />}
      </main>
    );
  }
}

export default Main;