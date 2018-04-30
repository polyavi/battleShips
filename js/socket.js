/**
 * @module BattleShips
 */
this.bts = this.bts || {};

(function () {
  'use strict';

  bts.socket = io();

  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $loginPage = $('#login'); // The login page
  var $canvas = $('#canvas'); // The chatroom page
  var username;
  var connected = false;
  var $currentInput = $usernameInput.focus();

  bts.$messagesContainer = $('#messages'); // The message element

  function setUsername () {
    username = $usernameInput.val().trim();

    if (username) {
      bts.me = username;
      bts.socket.emit('add user', username);

      $loginPage.fadeOut();
      $canvas.fadeIn();

      bts.showMessage('There is no oponent for you yet.');
    }
  }
  
  bts.showMessage = function(text){
    bts.$messagesContainer.find('.text').text(text);
    bts.$messagesContainer.fadeIn();
  }

  bts.hideMessage = function(){
      setTimeout(function(){
      bts.$messagesContainer.fadeOut();
    }, 1000);
  }

  function loadGame(username, message){
    bts.showMessage(message);
    bts.hideMessage();
    bts.oponent = username;
    bts.preload();
  }

  $window.keydown(function (event) {
    if (event.which === 13 && !username) {
      setUsername();
    }
  });

  bts.socket.on('user joined', function (username) {
    if(username){
      loadGame(username, username + ' joined.');
    }
  });

  bts.socket.on('login', function(username){
    if(username){
      loadGame(username, 'Your oponent is already here.');
    }
  });

  bts.socket.on('receive position', function (data) {
    bts.opponentShipsPositions = data;
    bts.setSectionsOccupiedByOponentShips();

    bts.showMessage('Oponent is ready to play.');

    if(bts.readyToStart){
      bts.startGame();
      bts.showMessage('Oponent\'s turn');
    }else{
      bts.hideMessage();
    }
  });

  bts.socket.on('get hit', function (data) {
    let section = bts.getSectionByPosition(data.row, data.line);
    section.reveal();
    section.cursor = 'default';

    if(!bts.finishGаme){
      bts.hideMessage();
    }
  });
}())

