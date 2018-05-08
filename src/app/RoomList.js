import React, { Component } from 'react';

class RoomList extends Component {
	constructor(){

	}
	
	render(){
		const roomNodes = this.state.rooms.map((room) =>{
			<li>
				<span>{room.name}</span>
				<span>{room.usersCount}</span>
			</li>
		});
		return (<div>
			<h3>List of available rooms</h3>
				<ul> {roomNodes} </ul>
			</div>
		);
	}
}