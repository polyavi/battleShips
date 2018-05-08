import React, { Component } from 'react';
import Game from './Game';
import PlayerList from './PlayerList';
import Chat from './Chat';


class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      socket: io({transports: ['websocket'], upgrade: false}),
      me: ''
    }
    this.setName = this.setName.bind(this);
  }

  setName = (name) =>{
    this.setState({me: name});
  }

  render() {
    return (
      <div>
        <div className="app">
          <PlayerList 
            socket={this.state.socket} 
            me={this.state.me} />
          <Game 
            socket={this.state.socket} 
            setName={this.setName} />
        </div>
        <Chat socket={this.state.socket} />
      </div>
    );
  }
}

export default App;