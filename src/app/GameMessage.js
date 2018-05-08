import React, { Component } from 'react';

class GameMessage extends Component {
	constructor(props){
    super(props);

    this.onAccept = this.onAccept.bind(this);
    this.onDecline = this.onDecline.bind(this);
  }

  onAccept = (e) => { 
    e.nativeEvent.preventDefault(); 
    this.props.onAccept();
  } 
  onDecline = (e) => { 
    e.nativeEvent.preventDefault(); 
    this.props.onDecline();
  } 
  render() {
    return (
			<div id="messages" className={this.props.className}>
				<div id="overlay" />
				<div className="text">{this.props.text}</div>
        {this.props.isQuestion && <div className="answers">
            <button onClick={this.onAccept}>Let's play.</button>
            <button onClick={this.onDecline}>I want another opponent.</button>
          </div>}
	    </div>
    );
  }
}

export default GameMessage;