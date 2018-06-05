import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter, Switch, Route } from 'react-router-dom'

window.socket = io({
	transports: ['websocket'],
	upgrade: false
});

ReactDOM.render(
	( 
		<BrowserRouter>
			<Route component = { App }/> 
		</BrowserRouter>
	), 
	document.getElementById('root')
)