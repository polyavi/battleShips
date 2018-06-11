import {
	TOGGLE_CHAT,
	ACTIVATE_TAB,
	ADD_CHAT_TAB,
	HIDE_CHAT_TAB,
	SHOW_CHAT_TAB,
	ADD_PENDING_TAB,
	REMOVE_PENDING_TAB,
	ADD_MESSAGE
} from '../actions/actionTypes';

const initialState = {
	messages: [],
	penndingChats: [],
	activeChat: 'global',
	chatTabs: [{
		name: 'global',
		isVisible: true
	}],
	isChatVisible: false
}

const chatReducer = (state = initialState, action) => {
	switch (action.type) {
		case TOGGLE_CHAT:
			if (action.payload !== null) return { ...state,
				isChatVisible: action.payload
			};
			else return { ...state,
				isChatVisible: !state.isChatVisible
			};
		case ACTIVATE_TAB:
			return { ...state,
				activeChat: action.payload,
				penndingChats: state.penndingChats.filter(chat => action.payload != chat)
			};
		case ADD_CHAT_TAB:
			return { ...state,
				chatTabs: [...state.chatTabs, {name: action.payload, isVisible: true
				}]
			};
		case HIDE_CHAT_TAB:
			return { ...state,
				chatTabs: state.chatTabs.map(chat => {
					if (chat.name == action.payload) return { ...chat,
						isVisible: false
					};
					return chat;
				}),
				activeChat: 'global'
			};
		case SHOW_CHAT_TAB:
			return { ...state,
				chatTabs: state.chatTabs.map(chat => {
					if (chat.name == action.payload) return { ...chat,
						isVisible: true
					};
					return chat;
				})
			};
		case ADD_PENDING_TAB:
			return { ...state,
				penndingChats: [...state.penndingChats, action.payload]
			};
		case REMOVE_PENDING_TAB:
			return { ...state,
				penndingChats: state.penndingChats.filter(chat => action.payload != chat.name)
			};
		case ADD_MESSAGE:
			return { ...state,
				messages: [...state.messages, action.payload]
			};
		default:
			return state;
	}
};
export default chatReducer;