import React from 'react';
import { connect } from 'react-redux';
import chatActions from '../../../actions/chatActions';

const ConnectedPlayerNode = ({ user, me, ...props }) => {
	let handleMessage = (e) => {
		props.toggleChat(true);
		props.activateTab(user.username);
		props.addChatTab(user.username);
	};

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

const PlayerNode = connect(null, dispatch => ({
    toggleChat: () => dispatch(chatActions.toggleChat(true)),
    activateTab: tab => dispatch(chatActions.activateTab(tab)),
    addChatTab: tab =>dispatch(chatActions.addChatTab(tab))
    })
)(ConnectedPlayerNode);

export default PlayerNode;