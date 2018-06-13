import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import chatActions from '../../actions/chatActions';
const mapStateToProps = state => {
  return {
    isChatVisible: state.chat.isChatVisible,
    isGameStarted: state.game.isGameStarted,
    isAdmin: state.game.isAdmin
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleChat: isVisible => dispatch(chatActions.toggleChat(isVisible))
  };
};

const ConnectedHeader = (props) => {
  let handleLeaveRoom = () => {
    if(props.isAdmin){
      window.socket.emit('remove room');
    }else{
      window.socket.emit('leave room');
    }
  }

  function toggleChat() {
    props.toggleChat(null);
  }

  function startGame() {
    window.socket.emit('start game');
  }
  
  return ( 
    <header>
      <h1 className = 'title' > Battleships </h1> 
      <ul className = 'menu' >
        { (props.location.pathname === '/createroom' || props.location.pathname === '/joinroom' )&&
          <li>
          <i className = 'icon-arrow-left' ></i> 
            <span onClick = { props.goBack }>Go back</span>  
          </li>
        }  
        {( props.location.pathname != '/' && 
          props.location.pathname.indexOf('/game') == -1 && 
          props.location.pathname != '/createroom' && 
          props.location.pathname != '/joinroom' ) &&
        <li>
          <Link to = '/createroom'> 
            <i className = 'icon-plus' > </i>
            Create room
          </Link>
        </li>
      }
      {
        ( props.location.pathname.indexOf('/game') > -1 && 
        props.isAdmin && 
        !props.isGameStarted) &&
        <li>
          <span onClick = { startGame }> 
            <i className = 'icon-dice'> </i>
            Start game
          </span>
        </li>
      }

      {
        (props.location.pathname.indexOf('/game') > -1) &&
        <li>
          <span to = '/rooms' onClick = { handleLeaveRoom }>
          <i className = 'icon-exit'> </i>
          Leave room
          </span>  
        </li>
      }

      { (props.location.pathname != '/') &&
          <li>
            <span onClick = { toggleChat } className = { props.isChatVisible ? 'shown' : '' }>
              <i className = 'icon-chat' ></i> 
              { props.isChatVisible ? 'Show users' : 'Show chat' } 
            </span>  
          </li>
      } 
      </ul> 
    </header>
  );
}
const Header = connect(mapStateToProps, mapDispatchToProps)(ConnectedHeader);

export default Header;