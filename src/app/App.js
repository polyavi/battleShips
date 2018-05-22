import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import Header from './Header/Header';
import Main from './Main/Main';
import SideBar from './Sidebar/SideBar';

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      me: '',
      isChatVisible: false,
    }

    this.startGame = this.startGame.bind(this);
  }

  componentDidMount(){
    this._ismounted = true;

    let self = this;
    window.socket.on('joined', (data)=>{
      if(self._ismounted){
        if(data.type == 'game'){
          
          self.setState({ isGameStarted: false, isChatVisible: true, isAdmin: data.admin, isGameOver: false});
        }else{
           self.setState({isChatVisible: true});
        }
      }
    })

    window.socket.on('allow movement', () =>{
      if(self._ismounted) self.setState({isGameStarted: true});
    })

    window.socket.on('logged in', (data)=>{
      self.goto = 'rooms';
      if(self._ismounted) self.setState({me: data});
    })

    window.socket.on('game over', (winner) =>{
      if(self._ismounted) self.setState({isGameOver: true, isWinner: self.state.me == winner ? true : false})
    })

    window.socket.on('close room', () =>{
      this.goto='rooms';
    })
  }

  componentWillUnmount(){
    this._ismounted = false;
  }

  toggleChat = () =>{
    this.setState({isChatVisible: !this.state.isChatVisible});
  }

  startGame = () =>{
    window.socket.emit('start game');
    this.setState({isGameStarted: true})
  }

  render() {
    if(this.goto == 'rooms' && this.props.location.pathname.indexOf('/rooms') == -1){
    this.goto = '';
     return <Redirect to="/rooms"/>
    }
    return (
      <div className="app">
        <Header
          location={this.props.location}
          startGame={this.startGame}
          isChatVisible={this.state.isChatVisible}
          isGameStarted={this.state.isGameStarted}
          isAdmin={this.state.isAdmin}
          toggleChat={this.toggleChat}/>
        <SideBar
          isChatVisible={this.state.isChatVisible}
          me={this.state.me}/>
        <Main
          isGameStarted={this.state.isGameStarted}
          isAdmin={this.state.isAdmin}
          isWinner={this.state.isWinner}
          isGameOver={this.state.isGameOver}
          me={this.state.me}/>
      </div>
      );
  }
}

export default App;