import React, { Component } from 'react';

class Herader extends Component {
  constructor(props){
    super(props);
  }

  handleChat = () =>{
    this.props.toggleChat();
  }
  
  handleCreate = () =>{
    this.props.createRoom();
  }

  handleRoomList = () =>{
    this.props.toggleRoomList();
  }

  handleLeaveRoom = () =>{
    this.props.leaveRoom();
  }

  handleGameStart = () =>{
    this.props.startGame();
  }

  render() {
    return (
      <header>
        <h1 className="title">Battleships</h1>
        <ul className="menu">
          {(this.props.screen != 'log in' && this.props.screen != 'game') &&
            <li>
              <span onClick={this.handleCreate}><i className="icon-plus" ></i>Create room</span>
            </li>
          } 
          {(this.props.screen != 'log in' && this.props.screen != 'game') && 
            <li>
              <span onClick={this.handleRoomList} className={this.props.isRoomListVisible ? "shown" : ""}>
                <i className="icon-dice"></i>
                {this.props.isRoomListVisible ? "Hide rooms" : "Show rooms"} 
            </span> 
            </li>
          }
          {(this.props.screen == 'game' && this.props.isAdmin && !this.props.isGameStarted) &&
            <li>
              <span onClick={this.handleGameStart}>
                <i className="icon-dice"></i>
                Start game
            </span>  
            </li>
          }
          {(this.props.screen == 'game') &&
            <li>
              <span onClick={this.handleLeaveRoom}>
                <i className="icon-exit"></i>
                Leave room
              </span> 
            </li>
          }
          {this.props.screen != 'log in' &&
            <li>
              <span onClick={this.handleChat} className={this.props.isChatVisible ? "shown" : ""}>
                <i className="icon-chat"></i>
                {this.props.isChatVisible ? "Show users" : "Show chat"} 
            </span> 
            </li>
          }
          
        </ul>
      </header>
    );
  }
}

export default Herader;