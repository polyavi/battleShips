import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Herader extends Component {
  constructor(props){
    super(props);

    this.handleGameStart = this.handleGameStart.bind(this);
  }

  handleChat = () =>{
    this.props.toggleChat();
  }

  handleLeaveRoom = () =>{
    window.socket.emit('leave room');
  }

  handleGameStart = () =>{
    this.props.startGame();
  }

  render() {
    return (
      <header>
        <h1 className="title">Battleships</h1>
        <ul className="menu">
          {(
            this.props.location.pathname != '/' && 
            this.props.location.pathname.indexOf('/game') == -1
            ) &&
            <li>
              <Link to="/createroom"><i className="icon-plus" ></i>Create room</Link>
            </li>
          }

          {(
            this.props.location.pathname.indexOf('/game') > -1 && 
            this.props.isAdmin && 
            !this.props.isGameStarted) &&
            <li>
              <span onClick={this.handleGameStart}>
                <i className="icon-dice"></i>
                Start game
            </span>  
            </li>
          }

          {(this.props.location.pathname.indexOf('/game') > -1) &&
            <li>
             <Link to="/rooms" onClick={this.handleLeaveRoom}>
                <i className="icon-exit"></i>
                Leave room
              </Link> 
            </li>
          }

          { this.props.location.pathname != '/' &&
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