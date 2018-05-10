import React, { Component } from 'react';
import Header from './Header';
import Main from './Main';
import SideBar from './SideBar';

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      socket: io({transports: ['websocket'], upgrade: false}),
      me: '',
      screen: 'log in',
      isChatVisible: false
    }

    this.logIn = this.logIn.bind(this);
    this.showChat = this.showChat.bind(this);
    this.hideChat = this.hideChat.bind(this);
    this.showCreateRoom = this.showCreateRoom.bind(this);
    this.showJoinRoom = this.showJoinRoom.bind(this);    

    let self = this;
    this.state.socket.on('joined', function(){
      self.setState({screen: 'game'});
    })
  }

  logIn = (name, screen) =>{
    this.setState({me: name, screen: 'room list'});
  }

  showChat = () =>{
    this.setState({isChatVisible: true});
  }

  hideChat = () =>{
    this.setState({isChatVisible: false});
  }

  showCreateRoom = () => {
    this.setState({screen: 'create room'});
  }

  showJoinRoom = (wrongPass) => {
    this.setState({screen: 'join room', wrongPass: wrongPass});
  }

  render() {
    return (
      <div className="app">
        <Header 
          isChatVisible={this.state.isChatVisible}
          screen={this.state.screen}
          hideChat={this.hideChat} 
          showChat={this.showChat} 
          createRoom={this.showCreateRoom}/>
        <SideBar 
          isChatVisible={this.state.isChatVisible} 
          socket={this.state.socket} 
          joinRoom={this.showJoinRoom}
          me={this.state.me}
          handleScreen={this.handleScreen}/>
        <Main
          screen={this.state.screen}
          wrongPass={this.state.wrongPass}
          socket={this.state.socket}
          hideChat={this.hideChat} 
          showChat={this.showChat}
          logIn={this.logIn}
          showJoinRoom={this.showJoinRoom}
          me={this.state.me}
           />
      </div>
    );
  }
}

export default App;