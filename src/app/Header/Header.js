import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const Herader = (props) => {
  let handleChat = () => {
    props.toggleChat();
  }

  let handleLeaveRoom = () => {
    window.socket.emit('leave room');
  }

  let handleGameStart = () => {
    props.startGame();
  }

  return ( 
    <header>
      <h1 className = "title" > Battleships </h1> 
      <ul className = "menu" > {
        ( props.location.pathname != '/' && props.location.pathname.indexOf('/game') == -1 ) &&
        <li>
          <Link to = "/createroom"> 
            <i className = "icon-plus" > </i>
            Create room
          </Link>
        </li>
      }
      {
        ( props.location.pathname.indexOf('/game') > -1 && 
        props.isAdmin && 
        !props.isGameStarted) &&
        <li>
          <span onClick = { handleGameStart }> 
            <i className = "icon-dice"> </i>
            Start game
          </span>
        </li>
      }

      {
        (props.location.pathname.indexOf('/game') > -1) &&
        <li>
          <span to = "/rooms" onClick = { handleLeaveRoom }>
          <i className = "icon-exit"> </i>
          Leave room
          </span>  
        </li>
      }

      { props.location.pathname != '/' &&
          <li>
            <span onClick = { handleChat } className = { props.isChatVisible ? "shown" : "" }>
              <i className = "icon-chat" ></i> 
              { props.isChatVisible ? "Show users" : "Show chat" } 
            </span>  
          </li>
      } 
      </ul> 
    </header>
  );
}

export default Herader;