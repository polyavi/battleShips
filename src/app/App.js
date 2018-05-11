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
      isChatVisible: true
    }
  }

  componentDidMount(){
    window.socket.on('joined', ()=>{
      this.setState({screen: 'game'});
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

  showCreateRoom = () =>{
    this.setState({screen: 'create room'});
  }

  showJoinRoom = (wrongPass) =>{
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
          joinRoom={this.showJoinRoom}
          me={this.state.me}
          handleScreen={this.handleScreen}/>
        <Main
          screen={this.state.screen}
          wrongPass={this.state.wrongPass}
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