import React, { Component } from 'react';
import { connect } from 'react-redux';
import gameActions from '../actions/gameActions';

import Header from './Header/Header';
import Main from './Main/Main';
import SideBar from './Sidebar/SideBar';

const mapStateToProps = state => {
  return { 
    connectedRoom: state.game.connectedRoom,
    isGameStarted: state.game.isGameStarted,
    isGameOver: state.game.isGameOver
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeLocation: path => dispatch(gameActions.changeLocation(path)),
  };
};

class ConnectedApp extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    window.socket.on('logged in', () => {
      this.props.history.push("/rooms");
    });
    window.socket.on('created room', (data) => {
      this.props.history.push("/game");
    });

    window.socket.on('joined room', (data) => {
      this.props.history.push("/game");
    });

    window.socket.on('removed room', (roomId) => {
      if(this.props.connectedRoom == roomId){
        this.props.history.push("/rooms");
      }
    });
    window.socket.on('close room', () => {
      this.props.history.push("/rooms");
    });
  }

  render() {
    return ( 
      <div className = 'app'>
        <Header 
          location = { this.props.location }
          goBack = {this.props.history.goBack}
        /> 
        <SideBar/>
        <Main
          isGameStarted= {this.props.isGameStarted}
          isGameOver= {this.props.isGameOver}
        />
      </div>
    );
  }
}

const App = connect(mapStateToProps, mapDispatchToProps)(ConnectedApp);

export default App;