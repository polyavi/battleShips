import React, { Component } from 'react';
import { Link } from 'react-router-dom';

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
    let passwordInput = document.getElementsByClassName('passwordInput')[0];
    if(passwordInput){
      passwordInput.focus();
    }
    let params = this.props.location.pathname.split('/')[2].split('&');

    this.setState({room: params[0], hasPass: (params[1] == 'false') ? false : true});

    window.socket.on('wrong pass', ()=>{
      this.setState({wrongPass: true, pass: ''});
    })
  }

  updatePass = (event) => {
    this.setState({ pass: event.target.value});
  }

  onSubmit = (e) => { 
    if(this.state.room == ''){
      this.state.room =  this.props.room;
    }

    window.socket.emit('join room', {room: this.state.room, pass: this.state.pass});
    
    this.setState({room: ''})
  }    

  render() {
    return (
      <div id="join-room">
        <form>
          <h3 className="title">{"Do you want to join " + this.state.room + "?"}</h3>

          {this.state.hasPass &&
          <h3 className="title">{this.state.wrongPass  ? "Wrong pass! Please try again." : "Enter password"}</h3>}
          {this.state.hasPass &&
            <input 
              className="passwordInput" 
              type="password" 
              maxLength="14" 
              onChange={this.updatePass} 
              value={this.state.pass}/>
          }
          <Link to="/game" onClick={this.onSubmit} className="submit">Join room</Link>
        </form>
      </div>
    );
  }
}

export default JoinRoom;