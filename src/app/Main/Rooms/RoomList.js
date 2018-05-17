import React, { Component } from 'react';

class RoomList extends Component {
	constructor(props){
    super(props);
    this.state = {
			rooms: []
		}

		this.handleClick = this.handleClick.bind(this);
	}

  componentDidMount = () =>{
    window.socket.on('rooms', (data) => {
			this.setState({ rooms: data });
		});
  }

	handleClick = (e) =>{
		let hasPass = false;
		if(e.target.parentNode.classList.contains('pass')){
			hasPass = true;
		}
		this.props.showJoinRoom(e.target.innerText, false, hasPass);
	}

	render(){
		let roomNodes;
		if(this.state.rooms.length > 0){
			roomNodes = this.state.rooms.map((room) =>{
				return(
					<li 
						key={room.key}
						className={room.hasPass ? "pass" : "no-pass"}>
						{room.length == 6 ? <span>{room.name}</span> :
						<div className="clickable" onClick={this.handleClick}>{room.name}</div>}
						<div className="actions">
							<span>players: {room.length}/6</span>
							<span >
								{room.hasPass ? <i className="icon-locked" title="You need to enter password to join this room."></i> :
									<i className="icon-unlocked" title="This room has no password.You can join it freely."></i>
								}
							</span>
						</div>
					</li>);
			});
		}
		return (
			<div className={this.props.isRoomListVisible ? "room-list" : "room-list hide"}>
				<h3>Rooms</h3>
				{!!roomNodes ? <ul> {roomNodes} </ul> : <span className="empty-list">There are no rooms yet. Hurry up and you can be the first one to create a room</span>}
			</div>
		);
	}
}
export default RoomList;