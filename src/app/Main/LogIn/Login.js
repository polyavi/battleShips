import React, { Component } from 'react';

class Login extends Component {

  constructor(props) {
    super(props);

    this.state = {
      username: ""
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    this._ismounted = true;
    document.getElementsByClassName('usernameInput')[0].focus();

    window.socket.on('taken username', () => {
      if (this._ismounted) this.setState({
        isUserNameTaken: true,
        username: ''
      });
    })
  }

  componentWillUnmount() {
    this._ismounted = false;
  }

  update = (event) => {
    this.setState({
      username: event.target.value
    });
  }

  onSubmit = (e) => {
    e.nativeEvent.preventDefault();
    if (this.state.username != "") {
      window.socket.emit('add user', this.state.username);
    }
  }

  render() {
    return ( 
      <div id = "login">
        <form onSubmit = { this.onSubmit }>
          <h3 className = "title"> 
            { this.state.isUserNameTaken ? 
              "This username is taken. Try another." : 
              "What's your nickname?"
            } 
            </h3> 
            <input 
              className = "usernameInput"
              type = "text"
              maxLength = "14"
              onChange = { this.update }
              value = { this.state.username }
              tabIndex = "1" 
            />
          <button tabIndex = "2" className = "submit"> Login </button> 
        </form> 
      </div>
    );
  }
}

export default Login;