import React, { Component } from 'react';
import Init from '../../js/Init'

class Canvas extends Component {
constructor(props) {
    super(props);

    this.state = {
      width: document.getElementsByTagName('main')[0].clientWidth,
      height: document.getElementsByTagName('main')[0].clientHeight
    }
  }
  
	showMessage = (message) =>{
		this.props.hendleOutSideMessages(message);
	}

  componentDidMount(){
    Init();
    
		bts.showMessage = this.showMessage;
    bts.hideMessage = this.props.hideMessage;
    
    window.onresize = () => {
      this.setState({
        width: document.getElementsByTagName('main')[0].clientWidth,
        height: document.getElementsByTagName('main')[0].clientHeight
      }
      );
    }
  }

  render() {
    return (
        <canvas id="canvas" width={this.state.width} height={this.state.height} />
    );
  }
}

export default Canvas;