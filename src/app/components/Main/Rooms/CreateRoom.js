import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class CreateRoom extends Component {
  constructor(props) {
    super(props);

    this.state = {
      room:'',
      pass: ''
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.updateRoomname = this.updateRoomname.bind(this);
    this.updatePass = this.updatePass.bind(this);
  }

  componentDidMount() {
    this._ismounted = true;
    let roomnameInput = document.getElementsByClassName('roomnameInput')[0];
    roomnameInput.focus();
    if(this.state.room != '' || this.state.pass != '')
    this.setState({
      room: '',
      pass: ''
    })
  }

  componentWillUnmount() {
    this._ismounted = false;
  }

  updateRoomname = (event) => {
    this.setState({
      room: event.target.value
    });
  }

  updatePass = (event) => {
    this.setState({
      pass: event.target.value
    });
  }

  onSubmit = (e) => {
    e.nativeEvent.preventDefault();

    window.socket.emit('create room', {
      room: this.state.room,
      pass: this.state.pass
    });
  }

  render() {
    return ( 
      <div id = 'join-room' >
        <form onSubmit = { this.onSubmit }>
          <h3 className = 'title' > Enter room name. </h3> 
          <input 
            className = 'roomnameInput'
            type = 'text'
            maxLength = '14'
            onChange = { this.updateRoomname }
            value = { this.state.room }
          /> 
          <h3 className = 'title'> Enter password </h3> 
          <input 
            className = 'passwordInput'
            type = 'password'
            maxLength = '14'
            onChange = { this.updatePass }
            value = { this.state.pass }
          /> 
          <button className = 'submit' > Create room </button> 
          </form> 
      </div>
    );
  }
}

export default CreateRoom;