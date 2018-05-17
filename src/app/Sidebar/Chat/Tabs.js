import React, { Component } from 'react';

class Tabs extends Component {
  constructor(props){
    super(props);
  }

  handleTabClick = (e) =>{
    this.props.activateTab(e.target.id);
  }
  
  render() {
  	let tabNodes;
  	if(this.props.tabs.length >0){
  		tabNodes= this.props.tabs.map(tab =>{
        let classes = ['tab'];
        if(this.props.activeTab == tab.socketName) classes.push('active');
        if(this.props.pendingMessages.indexOf(tab.socketName) > -1) classes.push('alert');

  			return (<div key={tab.socketName} className={classes.join(' ')} id={tab.socketName} onClick={this.handleTabClick}>{tab.name}</div>);
  		})
  	}
    return (
      <div className="tabs-container">
      	{tabNodes}
      </div>
    );
  }
}

export default Tabs;