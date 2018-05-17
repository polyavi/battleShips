import React, { Component } from 'react';

class PlayerList extends Component {
	constructor(props){
		super(props);

		this.state = {
			users: [],
			room: this.props.room
		}
	}

  componentDidMount(){
    window.socket.on('new user', (data) =>{
			this.setState({users: data});
		});
  }

	handleMessage = (e) => {
		let username = e.target.parentNode.parentNode.firstChild.innerText;
		let userId = e.target.parentNode.parentNode.id;
		window.socket.emit('direct message', userId);
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