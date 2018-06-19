import { CREATE_CONNECTION, SET_GAME, START_GAME, FINISH_GAME, ADD_PLAYER } from './actionTypes';

const createConnection = connection => ({
	type: CREATE_CONNECTION,
	payload: connection
});

const startGame = () => ({
	type: START_GAME
});

const finishGame = (isWinner) => ({
	type: FINISH_GAME,
	payload: isWinner
});

const setGame = () => ({
	type: SET_GAME
});
const addPlayer = (length) => ({
	type: ADD_PLAYER,
	payload: length
});
export default{
	createConnection,
	addPlayer,
	setGame,
	startGame,
	finishGame
};