import {
	TOGGLE_CHAT,
	ACTIVATE_TAB,
	ADD_CHAT_TAB,
	HIDE_CHAT_TAB,
	SHOW_CHAT_TAB,
	ADD_PENDING_TAB,
	REMOVE_PENDING_TAB,
	ADD_MESSAGE
} from "./actionTypes";

const toggleChat = (isVisible) => ({
	type: TOGGLE_CHAT,
	payload: isVisible
});

const activateTab = (tab) => ({
	type: ACTIVATE_TAB,
	payload: tab
});

const addChatTab = (tab) => ({
	type: ADD_CHAT_TAB,
	payload: tab
});

const hideChatTab = (tab) => ({
	type: HIDE_CHAT_TAB,
	payload: tab
});

const showChatTab = (tab) => ({
	type: SHOW_CHAT_TAB,
	payload: tab
});

const addPendingTab = (tab) => ({
	type: ADD_PENDING_TAB,
	payload: tab
});

const removePendingTab = (tab) => ({
	type: REMOVE_PENDING_TAB,
	payload: tab
});

const addMessage = (message, isSystem) => ({
	type: ADD_MESSAGE,
	payload: { ...message,
		isSystem
	}
});

export default {
	toggleChat,
	activateTab,
	addChatTab,
	hideChatTab,
	showChatTab,
	addPendingTab,
	removePendingTab,
	addMessage
}