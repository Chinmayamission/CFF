import * as React from 'react';

/* Based on https://gist.github.com/ebakhtarov/7460d22fff27566ebe50981cda01a7e2 */
class CCAvenueFrame extends React.Component<any, any> {
  constructor(props:any) {
    super(props);
    this.state = {
      width: 482,
      height: 500,
      ifr: null,
      src: ""
    };
  }
  componentDidMount() {
    window.addEventListener("message", this.handleFrameTasks, false);
    if (!this.state.ifr) return;
    this.state.ifr.onload = () => {
      this.state.ifr.contentWindow.postMessage('hello', '*');
    };
  }

  componentWillReceiveProps(nextProps) {

    /*for (const [objectid, liveData] of Object.entries(nextProps.objectsLive)) {
      const prevOn = this.props.objectsLive[objectid] ? this.props.objectsLive[objectid].on : null;
      if (prevOn !== liveData.on) {
        this.state.ifr.contentWindow.postMessage({ event: 'onoff', object: objectid, value: liveData.on }, '*');
      }
    }*/
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleFrameTasks);
  }

  handleFrameTasks = (e) => {
    if (e.data && e.data['newHeight']) {
      this.setState({"height": e.data['newHeight']});
    }
    //console.log("event received ", e);
  }

  render() {
    let $mid = "hi";
    let $encReq = "hi";
    let $xscode = "hi";
    var url = "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction&merchant_id=" + 
    $mid + "&encRequest=" + $encReq + "&access_code=" + $xscode;
    return (
        <iframe
          scrolling="No"
          frameBorder="0" 
          style={{ width: this.state.width, height: this.state.height }}
          src={this.state.src}
          ref={(f) => { this.setState({"ifr": f}); }}
        />
    );
  }
}

export default CCAvenueFrame;