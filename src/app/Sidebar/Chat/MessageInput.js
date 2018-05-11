import React, { Component } from 'react';

class MessageInput extends Component {
  constructor(props){
    super(props);
    this.state = {
    	text: ''
    }
  this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = (e) => {
  	e.nativeEvent.preventDefault(); 
    if(this.state.text != ''){
      this.props.onSendMessage(this.state.text);
      this.setState({text: ''});
    }
  }

  onTextChange = (e) => {
  	this.setState({text: e.target.value});
  }

  render() {
    return (
      <div className="message-input">
      <form onSubmit={this.handleSubmit}>
      	<input type="text" value={this.state.text} onChange={this.onTextChange}/>
      	<button>Send</button>
      	</form>
      </div>
    );
  }
}

export default MessageInput;