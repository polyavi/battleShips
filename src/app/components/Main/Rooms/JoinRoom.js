import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class JoinRoom extends Component {
  constructor(props){
    super(props);

    this.state = {
      pass: ""
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.updatePass = this.updatePass.bind(this);
  }

  componentDidMount(){
    let passwordInput = document.getElementsByClassName('passwordInput')[0];
    if(passwordInput){
      passwordInput.focus();
    }

    window.socket.on('wrong pass', ()=>{
      this.setState({wrongPass: true, pass: ''});
    })
  }

  updatePass = (event) => {
    this.setState({ pass: event.target.value});
  }

  onSubmit = (e) => {
    e.nativeEvent.preventDefault();

    if(this.state.room == ''){
      this.state.room =  this.props.room;
    }
    let room = this.props.location.hash.split('#')[1].split('&')[0];
    
    window.socket.emit('join room', {room: room, pass: this.state.pass});
  }    

  render() {
    let params = this.props.location.hash.split('#')[1].split('&');
    let room = params[0];
    let hasPass = (params[1] == 'false') ? false : true;
    
    return (
      <div id="join-room">
        <form onSubmit={this.onSubmit}>
          <h3 className="title">{"Do you want to join " + room + "?"}</h3>

          {hasPass &&
          <h3 className="title">{this.state.wrongPass  ? "Wrong pass! Please try again." : "Enter password"}</h3>}
          {hasPass &&
            <input 
              className="passwordInput" 
              type="password" 
              maxLength="14" 
              onChange={this.updatePass} 
              value={this.state.pass}/>
          }
          <button className="submit">Join room</button>
        </form>
      </div>
    );
  }
}

export default JoinRoom;