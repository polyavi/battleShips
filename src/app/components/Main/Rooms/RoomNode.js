import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const RoomNode = ({room}) =>{
	return (<li 
		className={room.hasPass ? 'pass' : 'no-pass'}>
		{room.length == 6 ? <span>{room.name}</span> :
		<Link to={'/joinroom#' + room.name + '&' + room.hasPass } className='clickable'>{room.name}</Link>}
		<div className='actions'>
			<span>players: {room.length}/6</span>
			<span>
				{room.hasPass ? <i className='icon-locked' title='You need to enter password to join this room.'></i> :
					<i className='icon-unlocked' title='This room has no password.You can join it freely.'></i>
				}
			</span>
		</div>
	</li>);
}

export default RoomNode;