import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return { 
    gameStates: state.game.gameStates,
    isAdmin: state.game.isAdmin
  };
};

const ConnectedGameMessage = (props) => {
  let handlePlayAgain = (e) => {
    e.nativeEvent.preventDefault();
    window.socket.emit('play again');
  }

  let handleLeaveRoom = (e) => {
    e.nativeEvent.preventDefault();
    window.socket.emit('leave room');
  }

  return ( 
    <div id = 'game-message' > 
    { props.gameStates.isGameOver &&
      <form>
        <h3 className = 'title' > 
          { props.gameStates.isWinner ? 'Congratulations! You won.' : 'Game over! You lost.' } 
        </h3> 
        <button onClick = { handlePlayAgain } className = 'submit'> Play again </button> 
        <button onClick = { handleLeaveRoom } className = 'submit' > Leave room </button> 
      </form>
    } 
    { (!props.gameStates.isGameStarted && !props.gameStates.isGameOver) &&
      <div>
        <h3 className = 'title'> 
          { props.isAdmin ? 
            'Hit start game when you are ready.' : 
            'Waiting for the game to start.'
          } 
        </h3> 
      </div>
    }

    </div>
  );
}
const GameMessage = connect(mapStateToProps)(ConnectedGameMessage);

export default GameMessage;