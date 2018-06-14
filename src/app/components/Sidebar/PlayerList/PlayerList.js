import React from 'react';
import { connect } from 'react-redux';
import PlayerNode from './PlayerNode';

const ConnectedPlayerList = (props) => {
	let playerNodes;
	if (props.users.length > 0) {
		playerNodes = props.users.map((user) => {
			return ( 
				<PlayerNode 
					key = { user.id }
					user = { user }
					me = { props.me }
				/>);
		});
	}
	
	return (<div className = 'player-list' >
		<h3> 
			<i className = 'icon-users'></i>
			online users
		</h3>
		{!!playerNodes ? 
			<ul> { playerNodes } < /ul> : 
			<span className='empty-list'>Log in to see online users.</span>
		} 
	</div>);
}

const PlayerList = connect(state => ({ 
    users: state.userData.users,
    me: state.userData.me.name,
  }))(ConnectedPlayerList);

export default PlayerList;