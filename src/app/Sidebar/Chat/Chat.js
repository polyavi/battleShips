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
          socketName: 'general',
          action: 'global message',
          messages: [
          ]
        }
      ]
    }
  }
  
  componentDidMount(){
    let self = this;

    window.socket.on('joined', (data)=>{
      let tabs = self.state.tabs;

      if(data.type == 'game' && !tabs.find(item =>{return data.name == item.name})){
        tabs.push({name: data.name, socketName: data.name, action: 'message to', messages:[]});
        self.setState({tabs: tabs, activeTab: data.name});
      }
      if(data.type == 'direct message' && !tabs.find(item =>{return data.name == item.name})){
        tabs.push({name: data.name.split(' to ')[1], socketName: data.name, action: 'message to', messages:[]})
        self.setState({tabs: tabs, activeTab: data.name});
      }
    });

    window.socket.on('go to tab', (data)=>{
      self.setState({activeTab: data});
    });

    window.socket.on('close room', (data)=>{
      let tabs = self.state.tabs.filter(tab =>{ return tab.socketName != data.room});

      tabs.find(tab =>{return tab.socketName == 'general'}).messages.push(data.message);

      self.setState({tabs: tabs, activeTab: 'general'});
    })

    window.socket.on('message', (data)=>{
      let tabs =  self.state.tabs;
      let room;
      if(data.room){
        room = data.room;
        if(!tabs.find(tab =>{ return tab.socketName == data.room})){
          tabs.push({name: room.split(' to ')[0], socketName: room, action: 'message to', messages:[]})
        }
      }else{
        room = 'general'
      }
      
      tabs.find(tab =>{return tab.socketName == room}).messages.push(data.message);

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
    let tab = this.state.tabs.find( tab => {return tab.socketName == this.state.activeTab})
    if(tab.socketName == 'general'){
      window.socket.emit(tab.action, text)
    }else{
      window.socket.emit(tab.action, {text: text, room: tab.socketName});
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
        		<MessageBoard messages={this.state.tabs.find( tab => {return tab.socketName == this.state.activeTab}).messages}/>
        		<MessageInput  onSendMessage={this.onSendMessage}/>
          </div>
      </div>
    );
  }
}

export default Chat;