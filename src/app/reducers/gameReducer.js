import { CREATE_CONNECTION, SET_GAME, START_GAME, FINISH_GAME } from '../actions/actionTypes';

const initialState = {
	connectedRoom: '',
	isAdmin: false,
	isGameStarted: false,
	isGameOver: false,
	isWinner: false
}

const gameReducer = (state = initialState, action) => {
	switch (action.type) {
		case CREATE_CONNECTION:
			return { ...state,
				isAdmin: action.payload.isAdmin,
				connectedRoom: action.payload.roomId
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