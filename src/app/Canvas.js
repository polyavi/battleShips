import React, { Component } from 'react';
import Init from './Init'

class Canvas extends Component {
constructor(props) {
    super(props);

    this.state = {
      width: document.getElementsByTagName('main')[0].clientWidth,
      height: document.getElementsByTagName('main')[0].clientHeight
    }
    this.showMessage = this.showMessage.bind(this);

    window.onresize = () => {
      this.setState({
        width: document.getElementsByClassName('game')[0].clientWidth,
        height: document.getElementsByClassName('game')[0].clientHeight
      }
      );
    }
  }
  
	showMessage = (message) =>{
		this.props.hendleOutSideMessages(message);
	}

  componentDidMount(){
    Init();

    bts.socket = this.props.socket;
		bts.showMessage = this.showMessage;
    bts.hideMessage = this.props.hideMessage;
  }

  render() {
    return (
        <canvas id="canvas" width={this.state.width} height={this.state.height} />
    );
  }
}

export default Canvas;