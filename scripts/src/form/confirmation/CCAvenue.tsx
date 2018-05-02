/// <reference path="../interfaces.d.ts"/>
import * as React from 'react';
import CCAvenueFrame from "./CCAvenueFrame";

class CCAvenue extends React.Component<any, any> {

 render() {
     let ccAvenueInfo = {

     };
     return (<div>
         <h2>CCAvenue Payment</h2>
         <CCAvenueFrame {...this.props} />
        </div>);
 }

}

export default CCAvenue;