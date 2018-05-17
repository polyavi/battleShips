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
	  		let messageNode = message.isAdminMessage ? 
	  			<div className="admin-message"> 
		  			<span className="sender" style={style}>{message.sender.name}</span>
		  				{message.text}
			  		<span className="time" >{message.time}</span>
					</div> :
					<div className="message" key={index}>
						<span className="sender" style={style}>{message.sender.name}: </span>
		  			<div className="message-body">
			  			<span className="text">{message.text}</span>
			  			<span className="time" >{message.time}</span>
						</div>
  				</div>
  			return messageNode;
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