import React, { Component } from 'react';

class Herader extends Component {
  constructor(props){
    super(props);
  }

  handleChat = () =>{
    if(this.props.isChatVisible){
      this.props.hideChat();
    }else{
      this.props.showChat();
    }
  }
  
  handleCreate = () =>{
    this.props.createRoom();
  }

  render() {
    return (
      <header>
        <h1 className="title">Battleships</h1>
        <ul className="menu">
          {this.props.screen != 'log in' && 
            <li>
              <span onClick={this.handleCreate}><i className="icon-plus" ></i>Create room</span>
            </li>
          }
          <li>
            <span onClick={this.handleChat} className={this.props.isChatVisible ? "shown" : ""}>
              <i className="icon-chat"></i>
              {this.props.isChatVisible ? "Hide chat" : "Show chat"} 
          </span> 
          </li>
        </ul>
      </header>
    );
  }
}

export default Herader;