import { SET_ROOMS, ADD_ROOM, REMOVE_ROOM, CHANGE_ROOM } from './actionTypes';

const setRooms = (rooms) => ({
	type: SET_ROOMS,
	payload: rooms
});

const addRoom = room => ({
	type: ADD_ROOM,
	payload: room
});

const removeRoom = (roomId) => ({
	type: REMOVE_ROOM,
	payload: roomId
});

const changeRoom = data => ({
	type: CHANGE_ROOM,
	payload: data
});

export default{
	setRooms,
	addRoom,
	removeRoom,
	changeRoom
}