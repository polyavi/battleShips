import React, { Component } from 'react';

class GameMessage extends Component {
	constructor(props){
    super(props);
  }

  onAccept = (e) => { 
    this.props.onAccept();
  } 

  onDecline = (e) => { 
    this.props.onDecline();
  } 
  
  render() {
    return (
			<div id="messages" className={this.props.className}>
				<div id="overlay" />
				<div className="text">{this.props.text}</div>
        {this.props.isQuestion && <div className="answers">
            <div onClick={this.onAccept}>Yes</div>
            <div onClick={this.onDecline}>No</div>
          </div>}
	    </div>
    );
  }
}

export default GameMessage;