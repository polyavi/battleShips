import React from 'react';

const TabNode = ({ name, classNames, ...props}) => {
  let handleTabClick = (e) => {
    if(props.activeChat != name){
      props.activateTab(name);
    }
  };

  let handleTabClose = (e) => {
    e.stopPropagation();
    props.hideChatTab(name);
  };

  return ( 
    <div className = { classNames.join(' ') } id = { name } onClick = { handleTabClick }> 
      { name } 
      { name != 'global' && 
        <span className = 'close'
          onClick = { handleTabClose } > x 
        </span> 
      }
    </div> 
  );
}

export default TabNode;