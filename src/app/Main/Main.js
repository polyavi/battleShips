import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'

import Canvas from './Game/Canvas'
import GameMessage from './Game/GameMessage'
import JoinRoom from './Rooms/JoinRoom';
import CreateRoom from './Rooms/CreateRoom';
import Login from './Login/Login'
import RoomList from './Rooms/RoomList'


class Main extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <main>
       <Switch>
          <Route exact path='/' component={Login}/>
          <Route path='/rooms' component={RoomList}/>
          <Route path='/joinroom' component={JoinRoom}/>
          <Route path='/createroom' component={CreateRoom}/>
          <Route path='/game' render={
            () =>  <div>
            <Canvas
              me={this.props.me}/>
            {(!this.props.isGameStarted || this.props.isGameOver) && 
              <GameMessage
              isGameStarted={this.props.isGameStarted}
              isAdmin={this.props.isAdmin}
              isWinner={this.props.isWinner}
              isGameOver={this.props.isGameOver} 
              isWinner={this.props.isWinner}/> 
            }
              </div>
            }
          />
         </Switch>
      </main>
    );
  }
}

export default Main;