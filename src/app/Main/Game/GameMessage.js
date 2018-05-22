import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class GameMessage extends Component {
  constructor(props){
    super(props);
  }

  handlePlayAgain = (e) => { 
    window.socket.emit('play again');
  }

  handleLeaveRoom = (e) => { 
    window.socket.emit('leave room');
  }     

  render() {
    return (
      <div id="game-message">
	      {this.props.isGameOver &&
		      <form>
	          <h3 className="title">{this.props.isWinner ? "Congratulations! You won." : "Game over! You lost."}</h3>
	          <Link to="/game" onClick={this.handlePlayAgain} className="submit">Play again</Link>
	          <Link to="/rooms" onClick={this.handleLeaveRoom} className="submit">Leave room</Link>
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