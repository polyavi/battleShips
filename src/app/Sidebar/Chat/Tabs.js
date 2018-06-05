import React, { Component } from 'react';

const Tabs = (props) =>{
	let tabNodes;

	if(props.tabs.length >0){
		tabNodes= props.tabs.filter(tab => {return tab.isVisible != false}).map(tab =>{
      let classNames = ['tab'];

      if(props.activeTab == tab.socketName) classNames.push('active');
      if(props.pendingMessages.indexOf(tab.socketName) > -1) classNames.push('alert');

      return <Tab key={tab.socketName} tab={tab} classNames={classNames} activateTab={props.activateTab} closeTab={props.closeTab}/>
		})
	}

  return (
    <div className="tabs-container">
    	{tabNodes}
    </div>
  );
}

const Tab = ({tab, classNames, activateTab, closeTab}) =>{
  let handleTabClick = (e) =>{
    activateTab(e.target.id);
  }

  let handleTabClose = (e) =>{
    e.stopPropagation();
    closeTab(e.target.parentNode.id);
  }

  return (<div className={classNames.join(' ')} id={tab.socketName} onClick={handleTabClick}>{tab.name} {tab.socketName != 'general' && <span className="close" onClick={handleTabClose}>x</span> }</div>);
}

export default Tabs;