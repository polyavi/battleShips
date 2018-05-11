import React, { Component } from 'react';

class RoomList extends Component {
	constructor(props){
    super(props);
    this.state = {
			rooms: []
		}

		this.handleClick = this.handleClick.bind(this);
	}

  componentDidMount = () =>{
    window.socket.on('rooms', (data) =>{
			this.setState({rooms: data});
		});
  }

	handleClick = (e) =>{
		this.props.showJoinRoom(e.target.innerText, false);
	}

	render(){
		let roomNodes;
		if(this.state.rooms.length > 0){
			roomNodes = this.state.rooms.map((room) =>{
				return(
					<li 
						key={room.key}>
						<span onClick={this.handleClick}>{room.name}</span>
						<span><i className={room.hasPass ? "icon-locked" : "icon-unlocked"}></i></span>
					</li>);
			});
		}
		return (
			<div className={this.props.screen == "room list" ? "room-list" : "room-list hide"}>
				<h3>List of available rooms</h3>
				{!!roomNodes && <ul> {roomNodes} </ul>}
			</div>
		);
	}
}
export default RoomList;