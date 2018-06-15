import React from 'react';

import Tabs from './Tabs';
import MessageBoard from './MessageBoard';
import MessageInput from './MessageInput';

const Chat = () => {
  return ( 
    <div className = 'chat'>
      <Tabs /> 
      <div className = 'tab-content' >
        <MessageBoard /> 
        <MessageInput />
      </div> 
    </div>
  );
}

export default Chat;