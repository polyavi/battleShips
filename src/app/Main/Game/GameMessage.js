import React, { Component } from 'react';

class GameMessage extends Component {
  constructor(props){
    super(props);
  }

  componentDidMount(){

  }

  handlePlayAgain = (e) => { 
    e.nativeEvent.preventDefault(); 
    window.socket.emit('play again');
  }

  handleLeaveRoom = (e) => { 
    e.nativeEvent.preventDefault(); 
    window.socket.emit('leave room');
  }     

  render() {
    return (
      <div id="game-message">
	      {this.props.isGameOver &&
		      <form>
	          <h3 className="title">{this.props.isWinner ? "Congratulations! You won." : "Game over! You lost."}</h3>
	          <button onClick={this.handlePlayAgain}>Play again</button>
	          <button onClick={this.handleLeaveRoom}>Leave room</button>
	         </form>
	      }
      	{!this.props.isGameStarted &&
      		<div>
	          <h3 className="title">{this.props.isAdmin ? "Hit start game when you are ready." : "Waiting for the game to start."}</h3>
      		</div>
      	}

      </div>
    );
  }
}

export default GameMessage;