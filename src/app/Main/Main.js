import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'

import Canvas from './Game/Canvas'
import GameMessage from './Game/GameMessage'
import JoinRoom from './Rooms/JoinRoom';
import CreateRoom from './Rooms/CreateRoom';
import Login from './Login/Login'
import RoomList from './Rooms/RoomList'


const Main = ({rooms, me, ...props}) =>{
  return (
    <main>
     <Switch>
        <Route exact path='/' component={Login}/>
        <Route path='/rooms' render = { () => <RoomList
          rooms={rooms} />
        }/>
        <Route path='/joinroom' component={JoinRoom}/>
        <Route path='/createroom' component={CreateRoom}/>
        <Route path='/game' render={
          () =>  <div>
          <Canvas
            me={me}/>
          {(!props.isGameStarted || props.isGameOver) && 
            <GameMessage
            props={props}/> 
          }
            </div>
          }
        />
       </Switch>
    </main>
  );
}

export default Main;