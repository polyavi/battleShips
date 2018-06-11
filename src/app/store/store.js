import { createStore, combineReducers } from 'redux';
import chatReducer from '../reducers/chatReducer';
import gameReducer from '../reducers/gameReducer';
import roomReducer from '../reducers/roomReducer';
import userReducer from '../reducers/userReducer';

const rootReducer = combineReducers({game: gameReducer, chat: chatReducer, rooms: roomReducer, userData: userReducer});
const store = createStore(rootReducer);

export default store;