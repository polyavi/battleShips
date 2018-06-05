import React, { Component } from 'react';

const MessageBoard = ({messages}) => {
	let messageNodes;
	if(messages && messages.length >0){
  	messageNodes = messages.map((message, index) => {
			return <Message message={message} index={index} />;
		})
  }

  return (
    <div className="message-board">
    	{!!messageNodes ? messageNodes : <div className="no-messages">No mesages yet!</div>}
    </div>
  );
}

const Message = ({message, index}) =>{
	let style = {
		color: message.sender.color
	}

	if(message.isAdminMessage){
		return (
		<div className="admin-message" key={index}> 
			<span className="sender" style={style}>{message.sender.name}</span>
				{message.text}
			<span className="time" >{message.time}</span>
		</div>)
	}
	
	return (<div className="message" key={index}>
		<span className="sender" style={style}>{message.sender.name}: </span>
		<div className="message-body">
			<span className="text">{message.text}</span>
			<span className="time" >{message.time}</span>
		</div>
	</div>)
}

export default MessageBoard;