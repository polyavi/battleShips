import React, { Component } from 'react';

class JoinRoom extends Component {
  constructor(props){
    super(props);

    this.state = {
      room: this.props.room || "",
      pass: ""
    }
    this.onSubmit = this.onSubmit.bind(this);
  }

  updateRoomname = (event) => {
    this.setState({ room: event.target.value});
  }

  updatePass = (event) => {
    this.setState({ pass: event.target.value});
  }

  onSubmit = (e) => { 
    e.nativeEvent.preventDefault(); 
    this.props.onSubmit(this.state.room, this.state.pass);
  }    

  render() {
    return (
      <div id="join-room">
        <form onSubmit={this.onSubmit}>
          <h3 className="title">{this.props.screen == 'create room' ? "Room name?" : this.props.room}</h3>
          {this.props.screen == 'create room' && 
            <input 
              className="roomnameInput" 
              type="text" 
              maxLength="14" 
              onChange={this.updateRoomname} 
              value={this.state.room}/>}
          <h3 className="title">{this.props.wrongPass ? "Wrong pass! Please try again." : "Password?"}</h3>
          <input 
            className="passwordInput" 
            type="password" 
            maxLength="14" 
            onChange={this.updatePass} 
            value={this.state.pass}/>
          <button>{this.props.screen == 'create room' ? "Create room" : "Join Room"}</button>
        </form>
      </div>
    );
  }
}

export default JoinRoom;