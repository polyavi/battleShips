import { 		
	SET_USERS,
	ADD_USER,
	REMOVE_USER
} from "../actions/actionTypes";

const initialState = {
	me: {
		name: '',
		id: ''
	},
	users: []
}

const userReducer = (state = initialState, action) => {
	switch (action.type) {
		case SET_USERS:
			return { ...state,
				users: [...action.payload.users],
				me: Object.assign({}, action.payload.me)
			};
		case ADD_USER:
			return { ...state,
				users: [...state.users, action.payload]
			};
		case REMOVE_USER:
			return { ...state,
				users: state.users.filter(article => article.id != action.payload)
			};
		default:
			return state;
	}
};
export default userReducer;