import React from 'react';
import PlayerList from './PlayerList/PlayerList';
import Chat from './Chat/Chat';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return { 
    isChatVisible:  state.chat.isChatVisible
  };
};

const ConnectedSideBar = ({isChatVisible}) => {
  return ( 
    <div className = 'sidebar' >
    	{isChatVisible ?
    		<Chat /> :
      	<PlayerList /> 
    	}
    </div>
  );
}

const SideBar = connect(mapStateToProps)(ConnectedSideBar);
export default SideBar;