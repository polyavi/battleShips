import React, { Component } from 'react';

class PlayerList extends Component {
	constructor(props){
		super(props);

		this.state = {
			socket: this.props.socket,
			users: [],
			room: this.props.room
		}

		this.state.socket.on('new user', (data) =>{
			this.setState({users: data});
		});

		this.handleMessage = this.handleMessage.bind(this);
	}

	handleMessage = (e) => {
		let userId = e.target.parentNode.id;
	}

	handleInvite = (e) =>{
		let userId = e.target.parentNode.id;
		this.state.socket.emit('invite', {room: this.state.room, user: userId})
	}
	
	render(){
		let playerNodes;
		if(this.state.users.length > 0){
			playerNodes = this.state.users.map((user) =>{
				return(
					<li 
						key={user.id} 
						id={user.id}>
							<span className="username" >{user.username}</span>
							{user.username != this.props.me &&
							<span>
								<span onClick={this.handleInvite} title="Invite to play" className="icon-dice"></span>
								<span onClick={this.handleMessage} title="Send message" className="icon-chat"></span>
							</span>
							}
					</li>
				);
			});
		}
		return (
			<div className={this.props.isChatVisible ? "player-list hide" : "player-list"}>
				<h3><i className="icon-users"></i> List of online users</h3>
				{!!playerNodes && <ul> {playerNodes} </ul>}
			</div>
		);
	}
}
export default PlayerList;