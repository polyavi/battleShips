import React, { Component } from 'react';
import Init from '../../canvasActions/Init'

class Canvas extends Component {
constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0
    }
  }

  componentDidMount(){
    this.setState({
      width: document.getElementsByTagName('main')[0].clientWidth,
      height: document.getElementsByTagName('main')[0].clientHeight
    });
    
    Init();
    
    bts.me = this.props.me;

    window.onresize = () => {
      this.setState({
        width: document.getElementsByTagName('main')[0].clientWidth,
        height: document.getElementsByTagName('main')[0].clientHeight
      });
    }
  }


  render() {
    return (
        <canvas id="canvas" width={this.state.width} height={this.state.height} />
    );
  }
}

export default Canvas;