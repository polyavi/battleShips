import React, { Component } from 'react';
import Game from './Game/Game';
import JoinRoom from './Rooms/JoinRoom';
import Login from './Login/Login'
import RoomList from './Rooms/RoomList'


class Main extends Component {
  constructor(props){
    super(props);

    this.state = {
      room: '',
      password: ''
    }
  }

  componentDidMount = () =>{
    window.socket.on('wrong pass', ()=>{
      this.props.showJoinRoom(true);
    })
  }
  
  handleLogIn = (username) =>{
    if(username != "")
    {
      this.props.logIn(username);
      this.setUsername(username);
    }
  }

  setUsername = (username) => {
    window.socket.emit('add user', username);
  }

  handleJoinRoom = (room, pass) =>{
  	this.setState({room: room, password: pass});
  	window.socket.emit('join room', {room, pass});
  }

  showJoinRoom = (room, wrongPass) =>{
    this.setState({room: room});
    this.props.showJoinRoom(wrongPass)
  }

  render() {
    return (
      <main>
          {this.props.screen == 'log in' && 
          	<Login onSubmit={this.handleLogIn} />}
        	<RoomList 
        		screen={this.props.screen}
        		showJoinRoom={this.showJoinRoom}
        	/>
          {(this.props.screen == 'join room' || this.props.screen == 'create room') && 
          	<JoinRoom 
          		onSubmit={this.handleJoinRoom} 
          		screen={this.props.screen}
          		wrongPass={this.props.wrongPass}
          		room={this.state.room}/>
          }
          {this.props.screen == 'game' && 
          	<Game
          		screen={this.props.screen}
          		me={this.props.me} />}
      </main>
    );
  }
}

export default Main;