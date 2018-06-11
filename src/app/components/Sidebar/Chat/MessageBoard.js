import React, { Component } from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return { 
  	messages: state.chat.messages.filter(message => message.to == state.chat.activeChat),
  	me: state.userData.me.name
  };
};

const ConnectedMessageBoard = ({ messages, me }) => {
	let messageNodes;
	if (messages && messages.length > 0) {
		messageNodes = messages.map((message, index) => {
			return <Message 
				message = { message }
				key = { index }
				me = { me }
			/>;
		})
	}

	return ( 
		<div className = 'message-board'> 
		{
			!!messageNodes ? 
			messageNodes : 
			<div className = 'no-messages' > No mesages yet! </div>
		} 
		</div>
	);
}

const Message = ({ message, index, me }) => {
	let style = {
		color: message.sender.color
	}

	if (message.isSystem) {
		return ( 
			<div className = 'admin-message'>
				<span className = 'sender' style = { style }> 
					{ message.sender.name == me? 'You' : message.sender.name } 
				</span> 
				{ message.text } 
				<span className = 'time' > { message.time } </span> 
			</div>
		)
	}

	return ( 
		<div className = 'message'>
			<span className = { message.sender.name == me ? 'sender me' : 'sender' } style = { style }> 
					{ message.sender.name == me? 'You:' : message.sender.name + ':' }
			</span> 
			<div className = 'message-body'>
				<span className = 'text' > { message.text } </span> 
				<span className = 'time' > { message.time } </span> 
			</div> 
		</div>
	)
}

const MessageBoard = connect(mapStateToProps)(ConnectedMessageBoard);

export default MessageBoard;