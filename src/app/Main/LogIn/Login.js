import React, { Component } from 'react';

class Login extends Component {

  constructor(props){
    super(props);

    this.state = {
      username: ""
    }
  }

  update = (event) => {
    this.setState({ username: event.target.value});
  }

  onSubmit = (e) => { 
    e.nativeEvent.preventDefault(); 
    this.props.onSubmit(this.state.username);
  }    

  render() {
    return (
      <div id="login">
        <form onSubmit={this.onSubmit}>
          <h3 className="title">What's your nickname?</h3>
          <input className="usernameInput" type="text" maxLength="14" onChange={this.update} value={this.state.username}/>
          <button>Log in</button>
        </form>
      </div>
    );
  }
}

export default Login;
