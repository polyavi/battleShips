import React, { Component } from 'react';

class JoinRoom extends Component {
  constructor(props){
    super(props);

    this.state = {
      room: "",
      pass: ""
    }
    this.onSubmit = this.onSubmit.bind(this);
  }
  componentDidMount(){
    let roomnameInput = document.getElementsByClassName('roomnameInput')[0];
    let passwordInput = document.getElementsByClassName('passwordInput')[0];
    if(roomnameInput){
      roomnameInput.focus();
    }else if(passwordInput){
      passwordInput.focus();
    }
    window.socket.on('wrong pass', ()=>{
      this.setState({pass:''})
    })
  }

  updateRoomname = (event) => {
    this.setState({ room: event.target.value});
  }

  updatePass = (event) => {
    this.setState({ pass: event.target.value});
  }

  onSubmit = (e) => { 
    e.nativeEvent.preventDefault(); 
    if(this.state.room == ''){
      this.state.room =  this.props.room;
    }
    this.props.onSubmit(this.state.room, this.state.pass);
    this.setState({room: ''})
  }    

  render() {
    return (
      <div id="join-room">
        <form onSubmit={this.onSubmit}>
          <h3 className="title">{this.props.screen == 'create room' ? "Enter room name." : "Do you want to join " + this.props.room + "?"}</h3>
          {this.props.screen == 'create room' && 
            <input 
              className="roomnameInput" 
              type="text" 
              maxLength="14" 
              onChange={this.updateRoomname} 
              value={this.state.room}/>
          }
          {(this.props.screen == 'create room' || this.props.hasPass) &&
          <h3 className="title">{this.props.wrongPass ? "Wrong pass! Please try again." : "Enter password"}</h3>}
          {(this.props.screen == 'create room' || this.props.hasPass) &&
            <input 
              className="passwordInput" 
              type="password" 
              maxLength="14" 
              onChange={this.updatePass} 
              value={this.state.pass}/>
          }
          <button>{this.props.screen == 'create room' ? "Create room" : "Join Room"}</button>
        </form>
      </div>
    );
  }
}

export default JoinRoom;