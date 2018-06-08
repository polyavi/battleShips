import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'

import Canvas from './Game/Canvas'
import GameMessage from './Game/GameMessage'
import JoinRoom from './Rooms/JoinRoom';
import CreateRoom from './Rooms/CreateRoom';
import Login from './Login/Login'
import RoomList from './Rooms/RoomList'

const Main = ({isGameStarted, isGameOver}) =>{
  return (
    <main>
     <Switch>
        <Route exact path='/' component={Login}/>
        <Route path='/rooms' component = {RoomList}/>
        <Route path='/joinroom' component={JoinRoom}/>
        <Route path='/createroom' component={CreateRoom}/>
        <Route path='/game' render={
          () =>  <div>
          <Canvas/>
          {(!isGameStarted || isGameOver) && 
            <GameMessage/> 
          }
            </div>
          }
        />
       </Switch>
    </main>
  );
}

export default Main;