## Battleships to do list
* Design UI

* Instant messages:
  Done - to all users in room
  Done - to a single user
  Done - to all connected users

* Rooms:
  Done - Create rooms
  Done - Join room
  - Leave room
  Done - Room properties (name, users, password)

* Sockets events:
  - Server side
    Done - on 'add user' : set socket username, broadcast 'new user' event
    Done - on 'join room' : if first user to join set room name and pass     
    Done - on 'invite' emit 'invitation' to invated player
    Done - on 'message to': emit 'message' to user
    Done - on 'global message': emit 'message' to all online users

    - on 'start game': send 'init canvas' 'game message' event 
    - on 'move': broadcast 'new position' to room 
    - on 'getPowerUp': broadcast 'remove powerup' 'game message' event to room - 
    - on 'hit opponent': broadcast 'got hit' 'game message' event with [player that atacked] and [player that got hit], if [player that got hit] died broadcast   'player died' if only one alive player left broadcast 'game over' with [winner] 
    - on 'step on mine': broadcast 'steped on mine' 'game message'with [player thet steped on it]

    
  - Client side
    Done - on 'new user' : update player list - 
    Done - on 'wrong pass': enter pass and send 'join room' or go back - 
    Done - on 'message': show message

    - on 'new position': move the ship with new position
    - on 'remove powerup': remove power up from map
    - on 'got hit' show message that the hit user lost life
    - on 'player died' show player died message
    - on 'game over' show losing or winning screen
    - on 'steped on mine' animate mine explosion and shows message
    - on 'invitation' show 'do you want ot join?' message 
    Done - on 'joined' init canvas 

* Game adjustments:
  Done - Game with more than 2 players 
  Done - New size and shape of the map
  Done - Players start positions
  Done - New map images
  - New ship images
  - Mine images
  - Power-up images

* New rules:
  - Player starts with ship placed in the corner of their choosing 
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
    - After a power-up is colected it apears again on different place after  30 sec
  
  - Along with power-up there are mines and traps on the map:
    - They are not visible to the players
    - Mine: when hit ship loses all inhansements on speed and range and loses 1 life

  - Winner is the last player with a ship left

* Information to be kept on server:
  - Chat:
    - history: array of rooms
    - room: array containing antries
    - entry: object containinг sender, time and message
  - Game: 
    - history: array of entries 
    - entry: object containing event, time and participants
    - participant: object containig player data: name and stats(position, range, speed, life)

