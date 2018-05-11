import React, { Component } from 'react';

import Canvas from './Canvas'
import GameMessage from './GameMessage'

class Game extends Component {
  constructor(props){
    super(props);

    this.state = {
      showMessage: false
    }
  }

  loadGame = (username, message) => {
    this.showMessage(message);
    this.setState(
      { 
        opponent : username,
      },()=>{ setTimeout(() =>{ this.hideMessage(); }, 2000)});
    bts.oponent = username;
    bts.preload();
  }

  showMessage = (message, isQuestion) => {
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

  hideMessage = () => {
    this.setState({ showMessage : false});
  }
  
  hendleOutSideMessages = (message) => {
    this.showMessage(message)
  }

  render() {
    return (
      <div className="game">
        { this.props.screen == 'game' && 
          <Canvas 
            me={this.props.me} 
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