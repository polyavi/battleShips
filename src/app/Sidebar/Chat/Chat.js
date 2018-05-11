import React, { Component } from 'react';
import Tabs from './Tabs'
import MessageBoard from './MessageBoard'
import MessageInput from './MessageInput'

class Chat extends Component {
  constructor(props){
    super(props);
    this.state = {
      activeTab: 'general',
      pendingMessages: [],
      tabs:[
        {
          name: 'general',
          action: 'global message',
          messages: [
          ]
        }
      ]
    }
  }
  
  componentDidMount(){
    let self = this;
    window.socket.on('joined', (tab)=>{
      let tabs = self.state.tabs;
      tabs.push({name: tab, action: 'message to', messages:[]})
      self.setState({tabs: tabs});
    })

    window.socket.on('message', (data)=>{
      let tabs =  self.state.tabs;
      let room;
      if(data.room){
        room = data.room;
      }else{
        room = 'general'
      }
      tabs.find(tab =>{return tab.name == room}).messages.push(data.message);
      if(self.state.activeTab != room){
        let pending = self.state.pendingMessages;
        pending.push(room);
        self.setState({tabs: tabs, pendingMessages: pending});
      }else{
        self.setState({tabs: tabs});
      }
    })
  }

  activateTab = (tabName) =>{
    if(this.state.pendingMessages.indexOf(tabName) > -1){
          this.setState({pendingMessages: this.state.pendingMessages.filter(tab =>{tab != tabName}), activeTab: tabName});
    }else{
      this.setState({activeTab: tabName});
    }
  }

  onSendMessage = (text) =>{
    let tab = this.state.tabs.find( tab => {return tab.name == this.state.activeTab})
    if(tab.name == 'general'){
      window.socket.emit(tab.action, text)
    }else{
      window.socket.emit(tab.action, {text: text, room: tab.name});
    }
  }

  render() {
    return (
      <div className={this.props.isChatVisible ? "chat" : "chat hide"}>
      		<Tabs 
            activeTab={this.state.activeTab}
            tabs={this.state.tabs}
            pendingMessages={this.state.pendingMessages}
            activateTab={this.activateTab} />
          <div className="tab-content">
        		<MessageBoard messages={this.state.tabs.find( tab => {return tab.name == this.state.activeTab}).messages}/>
        		<MessageInput  onSendMessage={this.onSendMessage}/>
          </div>
      </div>
    );
  }
}

export default Chat;