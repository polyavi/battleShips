import { CREATE_CONNECTION, SET_GAME, START_GAME, FINISH_GAME } from './actionTypes';

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

export default{
	createConnection,
	setGame,
	startGame,
	finishGame
}