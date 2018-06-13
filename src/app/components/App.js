import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import gameActions from '../actions/gameActions';

import Header from './Header/Header';
import Main from './Main/Main';
import SideBar from './Sidebar/SideBar';

const mapStateToProps = state => {
  return { 
    goto: state.game.path,
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

  componentDidUpdate(){
    if(this.props.goto != ''){
      this.props.changeLocation('');
    }
  }

  render() {
    if(this.props.goto && this.props.goto != '' && this.props.location.pathname.indexOf('/' + this.props.goto) == -1){
      return <Redirect to={this.props.goto}/>
    }
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