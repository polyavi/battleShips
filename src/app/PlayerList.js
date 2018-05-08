import React, { Component } from 'react';

class PlayerList extends Component {
	constructor(props){
		super(props);

		this.state = {
			socket: this.props.socket,
			users: []
		}

		this.state.socket.on('get users', (data) =>{
			this.setState({users: data});
		});

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick = (e) => {
		let userId = e.target.id;
		this.state.socket.emit('pair', userId);
	}
	
	render(){
		let playerNodes;
		if(this.state.users.length > 0){
			this.state.users = this.state.users.filter((user => user.username != this.props.me));
			console.log(this.state.users);
			playerNodes = this.state.users.map((user) =>{
				return(
					<li 
						key={user.id}>
						{user.paired ? 
							<span id={user.id} className="username">{user.username}</span> :
							<span id={user.id} className="username" onClick={this.handleClick}>{user.username}</span>
						}
						<span className={user.paired ? "paired" : "online"}></span>
					</li>
				);
			});
		}
		return (
			<div className="player-list">
				<h3>List of online users</h3>
				{!!playerNodes && <ul> {playerNodes} </ul>}
			</div>
		);
	}
}
export default PlayerList;