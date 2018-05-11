import React, { Component } from 'react';

class MessageBoard extends Component {
  constructor(props){
    super(props);
  }

  render() {
  	let messageNodes;
  	if(this.props.messages && this.props.messages.length >0){
	  	messageNodes = this.props.messages.map((message, index) => {
	  		let style = {
					color: message.sender.color
	  		}
	  		return(<div className="message" key={index}>
		  			<span className="sender" style={style}>{message.sender.name}:</span>
		  			<div className="message-body">
			  			<span className="text">{message.text}</span>
			  			<span className="time" >{message.time}</span>
						</div>
	  			</div>);
	  	})
	  }
    return (
      <div className="message-board">
      	{!!messageNodes ? messageNodes : <div className="no-messages">No mesages yet!</div>}
      </div>
    );
  }
}

export default MessageBoard;