import React, { Component } from 'react';
import { connect } from 'react-redux';
import chatActions from '../../../actions/chatActions';
import TabNode from './TabNode';
const mapStateToProps = state => {
  return {
    chatTabs: state.chat.chatTabs,
    penndingChats: state.chat.penndingChats,
    activeChat: state.chat.activeChat
  };
};

const mapDispatchToProps = dispatch => {
  return {
    activateTab: tab => dispatch(chatActions.activateTab(tab)),
    hideChatTab: tab => dispatch(chatActions.hideChatTab(tab)),
  };
};

const ConnectedTabs = ({chatTabs, penndingChats, activeChat, activateTab, hideChatTab}) => {
  let tabNodes;

  if (chatTabs.length > 0) {
    tabNodes = chatTabs.filter(tab => {
      return tab.isVisible === true;
  }).map((tab, index) => {
      let classNames = ['tab'];

      if (activeChat == tab.name) classNames.push('active');
        else if (penndingChats.indexOf(tab.name) > -1 ) classNames.push('alert');

      return (<TabNode
        key = { index }
        name = { tab.name }
        classNames = { classNames }
        activateTab = {activateTab}
        hideChatTab = {hideChatTab}
      />)
    })
  }

  return (<div className = 'tabs-container'> { tabNodes } </div>);
}

const Tabs = connect(mapStateToProps, mapDispatchToProps)(ConnectedTabs);

export default Tabs;