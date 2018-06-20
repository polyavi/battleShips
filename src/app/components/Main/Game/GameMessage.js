import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return  state.game;
};

const ConnectedGameMessage = (props) => {
  let handlePlayAgain = (e) => {
    e.nativeEvent.preventDefault();
    window.socket.emit('play again');
  };

  let handleLeaveRoom = (e) => {
    e.nativeEvent.preventDefault();
    window.socket.emit('leave room');
  };

  return ( 
    <div id = 'game-message' > 
    { props.isGameOver &&
      <form>
        <h3 className = 'title' > 
          { props.isWinner ? 'Congratulations! You won.' : 'Game over! You lost.' } 
        </h3> 
        <button onClick = { handlePlayAgain } className = 'submit'> Play again </button> 
        <button onClick = { handleLeaveRoom } className = 'submit' > Leave room </button> 
      </form>
    } 
    { (!props.isGameStarted && !props.isGameOver) &&
      <div>
        <h3 className = 'title'> 
          { props.isAdmin ? 
            ((props.numberOfPlayers < 2) ? 'Waiting for more players to join. (' + props.numberOfPlayers + '/6)' :'Hit start game when you are ready. (' + props.numberOfPlayers + '/6)') : 
            'Waiting for the game to start. (' + props.numberOfPlayers + '/6)'
          }
        </h3> 
      </div>
    }

    </div>
  );
}
const GameMessage = connect(mapStateToProps)(ConnectedGameMessage);

export default GameMessage;