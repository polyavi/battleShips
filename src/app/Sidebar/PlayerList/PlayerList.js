import React, { Component } from 'react';

const PlayerList = (props) => {

	let playerNodes;
	if (props.users.length > 0) {
		playerNodes = props.users.map((user) => {
			return ( 
				<ListItem 
					key = { user.id }
					user = { user }
					me = { props.me }
				/>
			);
		});
	}

	return ( 
		<div className = { props.isChatVisible ? "player-list hide" : "player-list" } >
			<h3> 
				<i className = "icon-users"></i>
				online users
			</h3>
			{!!playerNodes ? 
				<ul> { playerNodes } < /ul> : 
				<span className="empty-list">Log in to see online users.</span>
			} 
		</div>
	);
}

const ListItem = ({user, me }) => {
	let handleMessage = (e) => {
		let userId = e.target.parentNode.parentNode.id;
		window.socket.emit('direct message', userId);
	}

	return (
		<li id = { user.id }>
			<span className="username" > { user.username } </span> 
			{ user.username != me &&
				<span>
					<span  onClick = { handleMessage } title = "Send message" className = "icon-chat"> 
					</span> 
				</span>
			} 
			</li>
			)
}
export default PlayerList;