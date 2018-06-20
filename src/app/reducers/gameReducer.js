import { CREATE_CONNECTION, SET_GAME, START_GAME, FINISH_GAME, CHANGE_ROOM_LENGTH } from '../actions/actionTypes';

const initialState = {
	connectedRoom: '',
	isAdmin: false,
	isGameStarted: false,
	isGameOver: false,
	isWinner: false,
	numberOfPlayers: 0
}

const gameReducer = (state = initialState,  action) => {
	switch (action.type) {
		case CREATE_CONNECTION:
			return { ...state,
				isAdmin: action.payload.isAdmin,
				connectedRoom: action.payload.roomId,
				numberOfPlayers: action.payload.length
			};
		case CHANGE_ROOM_LENGTH:
			return { ...state,
				numberOfPlayers: action.payload
			};
		case SET_GAME:
			return { ...state,
				isGameStarted: false,
				isGameOver: false,
				isWinner: false
			};
		case START_GAME:
			return { ...state,
				isGameStarted: true
			};
		case FINISH_GAME:
			return { ...state,
				isGameOver: true,
				isWinner: action.payload
			};
		default:
			return state;
	}
};
export default gameReducer;