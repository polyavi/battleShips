import { SET_USERS, ADD_USER, REMOVE_USER } from './actionTypes';

const setUsers = (data) => ({
	type: SET_USERS,
	payload: data
});

const addUser = user => ({
	type: ADD_USER,
	payload: user
});

const removeUser = userId => ({
	type: REMOVE_USER,
	payload: userId
});

export default{
	setUsers,
	addUser,
	removeUser
};