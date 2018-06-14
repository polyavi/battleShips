import { SET_ROOMS, ADD_ROOM, REMOVE_ROOM, CHANGE_ROOM } from '../actions/actionTypes';

const initialState = [];

const roomReducer = (state = initialState, action) => {
	switch (action.type) {
		case SET_ROOMS:
			return [...action.payload];
		case ADD_ROOM:
			return [...state, action.payload];
		case REMOVE_ROOM:
			return state.filter(article => article.id != action.payload);
		case CHANGE_ROOM:
			return state.map(room => {
				if (room.id == action.payload.roomId) {
					room.length = action.payload.length;
				}
				return room;
			});
		default:
			return state;
	}
};
export default roomReducer;