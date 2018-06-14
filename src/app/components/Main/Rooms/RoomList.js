import React from 'react';
import { connect } from 'react-redux';
import RoomNode from './RoomNode';

const mapStateToProps = state => {
  return { 
    rooms: state.rooms
  };
};
const ConnectedRoomList = ({rooms}) =>{
	let roomNodes;
	if(rooms.length > 0){
		roomNodes = rooms.map((room) =>{
			return (<RoomNode room={room} key={room.id}/>);
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

const RoomList = connect(mapStateToProps)(ConnectedRoomList);

export default RoomList;