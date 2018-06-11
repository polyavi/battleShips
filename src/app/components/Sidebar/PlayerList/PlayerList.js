import React, { Component } from 'react';
import { connect } from 'react-redux';
import chatActions from '../../../actions/chatActions';

const ConnectedPlayerList = (props) => {

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
		<div className = 'player-list' >
			<h3> 
				<i className = 'icon-users'></i>
				online users
			</h3>
			{!!playerNodes ? 
				<ul> { playerNodes } < /ul> : 
				<span className='empty-list'>Log in to see online users.</span>
			} 
		</div>
	);
}

const ConnectedListItem = ({user, me, ...props }) => {
	let handleMessage = (e) => {
		props.toggleChat(true);
		props.activateTab(user.username);
		props.addChatTab(user.username);
	}

	return (
		<li id = { user.id }>
			<span className='username' > { user.username } </span> 
			{ user.username != me &&
				<span>
					<span onClick = { handleMessage } title = 'Send message' className = 'icon-chat'> 
					</span> 
				</span>
			} 
			</li>
			)
}
const PlayerList = connect(state => {
  return { 
    users: state.userData.users,
    me: state.userData.me.name,
  };
})(ConnectedPlayerList);

const ListItem = connect(null, dispatch => {
  return {
  	toggleChat: () => dispatch(chatActions.toggleChat(true)),
    activateTab: tab => dispatch(chatActions.activateTab(tab)),
    addChatTab: tab =>dispatch(chatActions.addChatTab(tab))
  };
})(ConnectedListItem);

export default PlayerList;