import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class RoomList extends Component {
	constructor(props){
    super(props);
    this.state = {
			rooms: []
		}
	}

  componentDidMount(){
  	this._ismounted = true;
    window.socket.on('rooms', (data) => {
			if(this._ismounted) this.setState({ rooms: data });
		});
  }

  componentWillUnmount(){
  	this._ismounted = false;
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
						<Link to={"/joinroom/" + room.name + "&" + room.hasPass } className="clickable">{room.name}</Link>}
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
			<div className="room-list">
				<h3>Rooms</h3>
				{!!roomNodes ? <ul> {roomNodes} </ul> : <span className="empty-list">There are no rooms yet. Hurry up and you can be the first one to create a room</span>}
			</div>
		);
	}
}
export default RoomList;