import React, { Component } from 'react';
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { 
    activeChat: state.chat.activeChat
  };
};

class ConnectedMessageInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
  }

  handleSubmit = (e) => {
    e.nativeEvent.preventDefault();
    if (this.state.text != '') {
      if (this.props.activeChat == 'global') {
        window.socket.emit('global message', this.state.text)
      } else {
        window.socket.emit('direct message', {
          text: this.state.text,
          name: this.props.activeChat
        });
      }
      this.setState({
        text: ''
      });
    }
  }

  onTextChange = (e) => {
    this.setState({
      text: e.target.value
    });
  }

  render() {
    return ( 
      <div className = "message-input">
        <form onSubmit = { this.handleSubmit }>
          <input 
            type = "text"
            value = { this.state.text }
            onChange = { this.onTextChange }
          /> 
          <button> Send </button> 
        </form> 
      </div>
    );
  }
}

const MessageInput = connect(mapStateToProps)(ConnectedMessageInput);

export default MessageInput;