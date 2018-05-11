import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

window.socket = io({transports: ['websocket'], upgrade: false});
ReactDOM.render(<App />, document.getElementById('root'));
