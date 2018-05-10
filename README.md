## Battleships to do list
* Design UI

* Instant messages:
  - to all users in room
  - to a single user
  - to all connected users

* Rooms:
  Done - Create rooms
  Done - Join room
  - Leave room
  Done - Room properties (name, users, password)

* Sockets events:
  - Server side
    Done - on 'add user' : set socket username, broadcast 'new user' event
    Done - on 'join room' : if first user to join set room name and pass 
    - on 'room message': broadcast 'message' to room 
    - on 'start game': send 'init canvas' event 
    - on 'move': broadcast 'new position' to room 
    - on 'getPowerUp': broadcast 'remove powerup' event to room - 
    - on 'hit opponent': broadcast 'got hit' event with [player that atacked] and [player that got hit], if [player that got hit] died broadcast   'player died' if only one alive player left broadcast 'game over' with [winner] 
    - on 'step on mine': broadcast 'steped on mine' with [player thet steped on it]
    - on 'message to': emit 'message' to user
    - on 'global message': emit 'message' to all online users
    - on 'invite' emit 'invitation' to invated player
    
  - Client side
    Done - on 'new user' : update player list - 
    Done - on 'wrong pass': enter pass and send 'join room' or go back - 
    - on 'message': show message
    - on 'new position': move the ship with new position
    - on 'remove powerup': remove power up from map
    - on 'got hit' show message that the hit user lost life
    - on 'player died' show player died message
    - on 'game over' show losing or winning screen
    - on 'steped on mine' animate mine explosion and shows message
    - on 'invitation' show 'do you want ot join?' message 
    - on 'joined' init canvas 

* Game adjustments:
  Done - Game with more than 2 players 
  Done - New size and shape of the map
  Done - Players start positions
  Done - New map images
  - New ship images
  - Mine images
  - Power-up images

* New rules:
  Done - Player starts with ship placed in the center of their section 
  Done - Player has monitions (number of shots they can make) 
  - Player can:
    Done - Move ship
    Done - Colect power-ups (players can see where the power-ups are) 
    Done - Atack other ships untill out of monitions 

  - Ships have:
    Done - Life (number of hits they can take before sinking) 
    Done - Speed (number of steps in 1 sec) 
    Done - Range (max distance they can fire) 

  - Power-ups:
    Done - Speed power-up : increaces speed by 1 
    Done - Range power-up : increaces reange by 1 
    Done - Monitions : adds additional monitions 
    Done - Life power-up : fills ship's life  
    - After a power-up is colected it apears again on different place after 1 min
  
  - Along with power-up there are mines and traps on the map:
    - They are not visible to the players
    - Mine: when hit ship loses all inhansements on speed and range and loses 1 life

  - Winner is the last player with a ship left
