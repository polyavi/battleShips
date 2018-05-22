import React, { Component } from 'react';
import PlayerList from './PlayerList/PlayerList';
import Chat from './Chat/Chat';

class SideBar extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div className="sidebar">
        	<Chat isChatVisible={this.props.isChatVisible}/>
          <PlayerList 
            me={this.props.me} 
            isChatVisible={this.props.isChatVisible}
            users={this.props.users}
            />
      </div>
    );
  }
}

export default SideBar;