import React, { Component } from 'react';
import Canvas from './Game/Canvas'
import GameMessage from './Game/GameMessage'
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

  componentDidMount(){
    let self = this;
    window.socket.on('wrong pass', ()=>{
      self.props.showJoinRoom(true);
    })

    window.socket.on('joined', (data)=>{
      if(data.type == 'game'){
        self.setState({isGameOver: false})
      }
    })

    window.socket.on('game over', (winner) =>{
      self.setState({isGameOver: true, isWinner: self.props.me == winner ? true : false})
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

  showJoinRoom = (room, wrongPass, hasPass) =>{
    this.setState({room: room});
    this.props.showJoinRoom(wrongPass, hasPass)
  }

  render() {
    return (
      <main>
          {this.props.screen == 'log in' && 
          	<Login onSubmit={this.handleLogIn} />}
        	<RoomList 
        		screen={this.props.screen}
        		showJoinRoom={this.showJoinRoom}
            isRoomListVisible={this.props.isRoomListVisible}
        	/>
          {(this.props.screen == 'join room' || this.props.screen == 'create room') && 
          	<JoinRoom 
          		onSubmit={this.handleJoinRoom} 
          		screen={this.props.screen}
          		wrongPass={this.props.wrongPass}
          		room={this.state.room}
              hasPass={this.props.hasPass}/>
          }
          {(this.props.screen == 'game' && !this.state.isGameOver) && 
            <Canvas 
              me={this.props.me}/> 
          }

          {(this.props.screen == 'game' && (this.state.isGameOver || !this.props.isGameStarted)) && 
            <GameMessage 
              isWinner={this.state.isWinner}
              isGameStarted={this.props.isGameStarted}
              isGameOver={this.state.isGameOver}
              isAdmin={this.props.isAdmin}/> 
          }
      </main>
    );
  }
}

export default Main;