import React, { Component } from 'react';
import PlayerList from './PlayerList';
import Chat from './Chat';

class SideBar extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div className="sidebar">
        	<Chat socket={this.props.socket}
                isChatVisible={this.props.isChatVisible}/>
          <PlayerList 
            socket={this.props.socket} 
            me={this.props.me} 
            isChatVisible={this.props.isChatVisible}/>
      </div>
    );
  }
}

export default SideBar;