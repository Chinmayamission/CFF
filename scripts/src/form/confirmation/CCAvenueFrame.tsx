import * as React from 'react';
import {API} from "aws-amplify";

declare var MODE: string;
/* Based on https://gist.github.com/ebakhtarov/7460d22fff27566ebe50981cda01a7e2 */
class CCAvenueFrame extends React.Component<any, any> {
  constructor(props:any) {
    super(props);
    let merchant_id = this.props.paymentMethodInfo.merchant_id;
    let encRequest = this.props.paymentMethodInfo.encRequest;
    let access_code = this.props.paymentMethodInfo.access_code;
    let iframe_url = (MODE == 'prod') ? "https://secure.ccavenue.com" : "https://test.ccavenue.com";
    iframe_url += `/transaction/transaction.do?command=initiateTransaction&merchant_id=${merchant_id}&encRequest=${encRequest}&access_code=${access_code}`;
    this.state = {
      width: 482,
      height: 500,
      ifr: null,
      iframe_url: iframe_url
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
    return (
        <iframe
          scrolling="No"
          frameBorder="0" 
          style={{ width: this.state.width, height: this.state.height }}
          src={this.state.iframe_url}
          ref={(f) => { this.setState({"ifr": f}); }}
        />
    );
  }
}

export default CCAvenueFrame;