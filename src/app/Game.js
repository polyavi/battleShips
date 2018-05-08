import React, { Component } from 'react';
import Login from './Login'
import Canvas from './Canvas'
import GameMessage from './GameMessage'

class Game extends Component {
  constructor(props){
    super(props);

    this.state = {
      myUsername: "",
      showMessage: false,
      showLogin: true,
      showCanvas: false,
      socket: this.props.socket
    }

    this.handleUpdate = this.handleUpdate.bind(this);
    this.setUsername = this.setUsername.bind(this);
    this.loadGame = this.loadGame.bind(this);
    this.hideMessage = this.hideMessage.bind(this);

    this.hendleOutSideMessages = this.hendleOutSideMessages.bind(this);
    this.onAccept = this.onAccept.bind(this);
    this.onDecline = this.onDecline.bind(this);
    let self = this;

    this.state.socket.on('pair request', (data) =>{
      if(data.username){
        this.showMessage(data.username + " wants to start a game with you.", true);
        this.setState({opponentId: data.id, opponent: data.username});
      }
    });

    this.state.socket.on('accepted', (username) =>{
      self.loadGame(username, username + ' joined.');
    });

    this.state.socket.on('declined', (username) =>{
      this.setState({opponentId: 0});
      if(bts.oponent){
        self.hideMessage();
      }else{
        self.showMessage('Choose other user to play with.');
      }
    });

    this.state.socket.on('receive position',(data) =>{
      if(bts.readyToStart){
        self.showMessage("Oponent's turn");
      }else{
        self.showMessage('Oponent is ready to play.');
        setTimeout(() =>{ this.hideMessage(); }, 2000);
      }
    });
  }

  onAccept = (e) => { 
    this.state.socket.emit('accept', this.state.opponentId);
    this.loadGame(this.state.opponent, this.state.opponent + ' joined.');
  } 

  onDecline = (e) => { 
    this.state.socket.emit('decline', this.state.opponentId);
    this.setState({opponentId: 0});
    if(bts.oponent){
      this.hideMessage();
    }else{
      this.showMessage('Choose other user to play with.');
    }
  }

  handleUpdate = (username) => {
    if(username != "")
    {
      this.setState(
        { 
          me : username,
          showMessage : true,
          showLogin : false,
          showCanvas : true,
          messageText : 'Choose user to play with.'
        }
      );
      this.props.setName(username);
      this.setUsername(username);
    }
  }

  setUsername (username) {
    this.state.socket.emit('add user', username);
  }

  loadGame(username, message){
    this.showMessage(message);
    this.setState(
      { 
        opponent : username,
      },()=>{ setTimeout(() =>{ this.hideMessage(); }, 2000)});
    bts.oponent = username;
    bts.preload();
  }

  showMessage(message, isQuestion){
    if(!isQuestion) {
      isQuestion = false;
    }

    this.setState(
      { 
        showMessage : true,
        messageText : message,
        isQuestion : isQuestion
      });
  }

  hideMessage(){
    this.setState({ showMessage : false});
  }
  
  hendleOutSideMessages = (message) =>{
    this.showMessage(message)
  }

  render() {
    return (
      <div className="game">
        { this.state.showLogin && 
          <Login 
            onSubmit={this.handleUpdate}/> 
        }
        { this.state.showCanvas && 
          <Canvas 
            socket={this.state.socket} 
            me={this.state.me} 
            hendleOutSideMessages={this.hendleOutSideMessages} 
            hideMessage={this.hideMessage}/> 
        }
        <GameMessage 
          onAccept={this.onAccept} 
          onDecline={this.onDecline} 
          isQuestion={this.state.isQuestion} 
          text={this.state.messageText} 
          className={this.state.showMessage ? "show" : ""}/>
      </div>
    );
  }
}

export default Game;