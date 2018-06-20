import React, { Component } from 'react';
import InitCanvas from './canvasActions/InitCanvas';
import { connect } from 'react-redux';
const mapStateToProps = state => {
  return { 
    me: state.userData.me.name
  };
};

class ConnectedCanvas extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: document.getElementsByTagName('body')[0].clientWidth*0.8,
      height: document.getElementsByTagName('body')[0].clientHeight - 50
    };
  }

  componentDidMount() {

    InitCanvas(this.props.me);

    window.onresize = () => {
      this.setState({
        width: document.getElementsByTagName('main')[0].clientWidth,
        height: document.getElementsByTagName('main')[0].clientHeight
      });
    };
  }

  render() {
    return ( 
      <canvas 
        id = 'canvas'
        width = { this.state.width }
        height = { this.state.height }
      />
    );
  }
}

const Canvas = connect(mapStateToProps)(ConnectedCanvas);

export default Canvas;