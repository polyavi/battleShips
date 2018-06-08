import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Provider } from "react-redux";
import store from "./store/store";
import socketEventHandlers from "./socketEventHandlers/socketEventHandlers";

window.socket = io({
	transports: ['websocket'],
	upgrade: false
});

socketEventHandlers();

ReactDOM.render(
	( 
		<Provider store={store}>
			<BrowserRouter>
				<Route component = { App }/> 
			</BrowserRouter>
	  </Provider>
	), 
	document.getElementById('root')
)