import React, { Component } from 'react';

class PlayerList extends Component {
	constructor(props){
		super(props);
	}

	handleMessage = (e) => {
		let userId = e.target.parentNode.parentNode.id;
		window.socket.emit('direct message', userId);
	}
	
	render(){
		let playerNodes;
		if(this.props.users.length > 0){
			playerNodes = this.props.users.map((user) =>{
				return(
					<li 
						key={user.id} 
						id={user.id}>
							<span className="username" >{user.username}</span>
							{user.username != this.props.me &&
							<span>
								<span onClick={this.handleMessage} title="Send message" className="icon-chat"></span>
							</span>
							}
					</li>
				);
			});
		}
		return (
			<div className={this.props.isChatVisible ? "player-list hide" : "player-list"}>
				<h3><i className="icon-users"></i>online users</h3>
				{!!playerNodes ? <ul> {playerNodes} </ul> : <span className="empty-list">Log in to see online users.</span>}
			</div>
		);
	}
}
export default PlayerList;