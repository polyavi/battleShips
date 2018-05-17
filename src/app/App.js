import React, { Component } from 'react';
import Header from './Header/Header';
import Main from './Main/Main';
import SideBar from './Sidebar/SideBar';

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      me: '',
      screen: 'log in',
      isChatVisible: false,
      isRoomListVisible: false
    }
    this.startGame = this.startGame.bind(this);
  }

  componentDidMount(){
    window.socket.on('joined', (data)=>{
      if(data.type = 'game'){
        this.setState({screen: 'game', isGameStarted: false, isRoomListVisible: false, isChatVisible: true, isAdmin: data.admin});
      }
    })

    window.socket.on('allow movement', () =>{
      this.setState({isGameStarted: true});
    })
  }

  logIn = (name, screen) =>{
    this.setState({me: name, isRoomListVisible: true, screen:'room list'});
  }

  toggleChat = () =>{
    this.setState({isChatVisible: !this.state.isChatVisible});
  }

  toggleRoomList = () =>{
    this.setState({isRoomListVisible: !this.state.isRoomListVisible});
  }

  leaveRoom = () =>{
    window.socket.emit('leave room');
    this.setState({isRoomListVisible: true, screen:'room list'});
  }

  showCreateRoom = () =>{
    this.setState({screen: 'create room', isRoomListVisible: false});
  }

  showJoinRoom = (wrongPass, hasPass) =>{
    this.setState({screen: 'join room', wrongPass: wrongPass, roomHasPass: hasPass, isRoomListVisible: false});
  }

  startGame = () =>{
    window.socket.emit('start game');
    this.setState({isGameStarted: true})
  }

  render() {
    return (
      <div className="app">
        <Header 
          isChatVisible={this.state.isChatVisible}
          isRoomListVisible={this.state.isRoomListVisible}
          screen={this.state.screen}
          createRoom={this.showCreateRoom}
          toggleChat={this.toggleChat}
          toggleRoomList={this.toggleRoomList}
          leaveRoom={this.leaveRoom}
          isAdmin={this.state.isAdmin}
          startGame={this.startGame}
          isGameStarted={this.state.isGameStarted}/>
        <SideBar 
          isChatVisible={this.state.isChatVisible} 
          me={this.state.me}/>
        <Main
          isRoomListVisible={this.state.isRoomListVisible}
          screen={this.state.screen}
          wrongPass={this.state.wrongPass} 
          logIn={this.logIn}
          showJoinRoom={this.showJoinRoom}
          me={this.state.me}
          hasPass={this.state.roomHasPass}
          isGameStarted={this.state.isGameStarted}
          isAdmin={this.state.isAdmin}
           />
      </div>
    );
  }
}

export default App;