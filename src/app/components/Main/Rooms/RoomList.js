import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return { 
    rooms: state.rooms
  };
};
const ConnectedRoomList = ({rooms}) =>{
	let roomNodes;
	if(rooms.length > 0){
		roomNodes = rooms.map((room) =>{
			return <Room room={room} key={room.id}/>
		});
	}
	
	return (
		<div className='room-list'>
			<h3>Rooms</h3>
			{rooms.length > 0 ? 
				<ul> {roomNodes} </ul> : 
				<span className='empty-list'>There are no rooms yet. Hurry up and you can be the first one to create a room</span>}
		</div>
	);
}

const Room = ({room}) =>{
	return <li 
		className={room.hasPass ? 'pass' : 'no-pass'}>
		{room.length == 6 ? <span>{room.name}</span> :
		<Link to={'/joinroom#' + room.name + '&' + room.hasPass } className='clickable'>{room.name}</Link>}
		<div className='actions'>
			<span>players: {room.length}/6</span>
			<span>
				{room.hasPass ? <i className='icon-locked' title='You need to enter password to join this room.'></i> :
					<i className='icon-unlocked' title='This room has no password.You can join it freely.'></i>
				}
			</span>
		</div>
	</li>
}
const RoomList = connect(mapStateToProps)(ConnectedRoomList);

export default RoomList;