import { CHANGE_LOCATION, CREATE_CONNECTION, SET_GAME, START_GAME, FINISH_GAME } from '../actions/actionTypes';

const initialState = {
	path: '',
	connectedRoom: '',
	isAdmin: false,
	gameStates: {
		isGameStarted: false,
		isGameOver: false,
		isWinner: false
	}
}

const gameReducer = (state = initialState, action) => {
	switch (action.type) {
		case CHANGE_LOCATION:
			return { ...state,
				path: action.payload
			};
		case CREATE_CONNECTION:
			return { ...state,
				isAdmin: action.payload.isAdmin,
				connectedRoom: action.payload.roomId
			};
		case SET_GAME:
			return { ...state,
				gameStates: Object.assign( {}, ...initialState.gameStates)
			};
		case START_GAME:
			return { ...state,
				gameStates: { ...state.gameStates,
					isGameStarted: true
				}
			};
		case FINISH_GAME:
			return { ...state,
				gameStates: {
					isGameOver: true,
					isWinner: action.payload
				}
			};
		default:
			return state;
	}
};
export default gameReducer;