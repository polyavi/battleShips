import React, { Component } from 'react';
import Init from './Init'

class Canvas extends Component {
constructor(props) {
    super(props);

    //this.state = {
    //  width: document.getElementsByTagName('body')[0].clientWidth*0.8,
    //  height: document.getElementsByTagName('body')[0].clientHeight*0.8
    //}
    this.getHit = this.getHit.bind(this);
    this.receivePosition = this.receivePosition.bind(this);
    this.showMessage = this.showMessage.bind(this);


    this.props.socket.on('get hit',this.getHit);

    this.props.socket.on('receive position', this.receivePosition);

    //window.onresize = () => {
    //  this.setState({
    //    width: document.getElementsByClassName('game')[0].clientWidth,
    //    height: document.getElementsByClassName('game')[0].clientHeight
    //  }
    //  );
    //}
  }

	getHit = (data) =>{
    let section = bts.getSectionByPosition(data.row, data.line);
    section.reveal();
    section.cursor = 'default';

    if(!bts.finishGаme){
     this.props.hideMessage();
    }
  }

	receivePosition = (data) =>{
    bts.opponentShipsPositions = data;

    bts.setSectionsOccupiedByOponentShips();

    if(bts.readyToStart){
      bts.startGame();
    }
  }
  
	showMessage = (message) =>{
		this.props.hendleOutSideMessages(message);
	}

  componentDidMount(){
    Init();

    bts.socket = this.props.socket;
		bts.me = this.props.me;
		bts.showMessage = this.showMessage;
    bts.hideMessage = this.props.hideMessage;
  }

  render() {
    return (
        <canvas id="canvas" width="980" height="455" />
    );
  }
}

export default Canvas;