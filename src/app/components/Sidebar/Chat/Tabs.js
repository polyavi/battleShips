import React, { Component } from 'react';
import { connect } from "react-redux";
import chatActions from "../../../actions/chatActions";

const mapStateToProps = state => {
  return {
    chatTabs: state.chat.chatTabs,
    penndingChats: state.chat.penndingChats,
    activeChat: state.chat.activeChat
  };
};

const ConnectedTabs = ({chatTabs, penndingChats, activeChat}) => {
  let tabNodes;

  if (chatTabs.length > 0) {
    tabNodes = chatTabs.filter(tab => {
      return tab.isVisible === true
  }).map((tab, index) => {
      let classNames = ['tab'];

      if (activeChat == tab.name) classNames.push('active') 
        else if (penndingChats.indexOf(tab.name) > -1 ) classNames.push('alert');

      return (<Tab
        key = { index }
        name = { tab.name }
        classNames = { classNames }
      />)
    })
  }

  return (<div className = "tabs-container"> { tabNodes } </div>);
}

const mapDispatchToProps = dispatch => {
  return {
    activateTab: tab => dispatch(chatActions.activateTab(tab)),
    hideChatTab: tab => dispatch(chatActions.hideChatTab(tab)),
  };
};

const ConnectedTab = ({ name, classNames, ...props}) => {
  let handleTabClick = (e) => {
    if(props.activeChat != name){
      props.activateTab(name);
    }
  }

  let handleTabClose = (e) => {
    e.stopPropagation();
    props.hideChatTab(name);
  }

  return ( 
    <div className = { classNames.join(' ') } id = { name } onClick = { handleTabClick }> 
      { name } 
      { name != 'global' && 
        <span className = "close"
          onClick = { handleTabClose } > x 
        </span> 
      }
    </div> 
  );
}

const Tabs = connect(mapStateToProps)(ConnectedTabs);
const Tab = connect(mapStateToProps, mapDispatchToProps)(ConnectedTab);

export default Tabs;