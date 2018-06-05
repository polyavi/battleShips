import React, { Component } from 'react';
import PlayerList from './PlayerList/PlayerList';
import Chat from './Chat/Chat';

const SideBar = (props) => {
  return ( 
    <div className = "sidebar" >
      <Chat isChatVisible = { props.isChatVisible } /> 
      <PlayerList 
        me = { props.me }
        isChatVisible = { props.isChatVisible }
        users = { props.users }
      /> 
    </div>
  );
}

export default SideBar;