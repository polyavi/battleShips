import React, { Component } from 'react';

class Chat extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div className={this.props.isChatVisible ? "chat" : "chat hide"}>

      </div>
    );
  }
}

export default Chat;