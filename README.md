## Battleships to do list
* Design UI

* Instant messages:
  Done - to all users in room
  Done - to a single user
  Done - to all connected users

* Rooms:
  Done - Create rooms
  Done - Join room
  Done - Leave room
  Done - Room properties (name, users, password)

* Sockets events:
  - Server side
    Done - on 'add user' : set socket username, broadcast 'new user' event
    Done - on 'join room' : emit 'wrong pass' or 'joined', if room is now created emit 'rooms'   
    Done - on 'message to': emit 'message' to user
    Done - on 'global message': emit 'message' to all online users
    Done - on 'init canvas': emit 'init field' to socket and 'positions' to all players in room

    Done - on 'move': broadcast 'positions' to room 
    Done - on 'collect powerup': broadcast 'remove powerup' 'game message' event to room - 
    Done - on 'hit': broadcast:
      Done # 'got hit' 'game message' event with [player that atacked] and [player that got hit] 
      Done # 'game over' with [winner] if only one alive player left  
      Done # 'player sunk' if [player that got hit] died
    
  - Client side
    Done - on 'new user' : update player list - 
    Done - on 'wrong pass': enter pass and send 'join room' or go back - 
    Done - on 'message': show message
    Done - on 'joined': init canvas and emit 'init canvas'
    Done - on 'positions': move the ships to the new positions

    Done - on 'new position': move the ship with new position
    Done - on 'remove powerup': remove power up from map
    Done - on 'add powerup': add power up to map
    Done - on 'prop change' show message that the hit user lost life
    Done - on 'player sunk' show player died message
    Done - on 'game over' show losing or winning screen
    Done - on 'init field' draw field 

* Game adjustments:
  Done - Game with more than 2 players 
  Done - New size and shape of the map
  Done - Players start positions
  Done - New map images

  - New ship images
  - Mine images
  - Power-up images

* New rules:
  Done - Player starts with ship placed in each corner 
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
    Done - After a power-up is colected it apears again on different place after  30 sec

  - Winner is the last player with a ship left

