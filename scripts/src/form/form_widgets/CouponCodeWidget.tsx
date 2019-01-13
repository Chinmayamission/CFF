import * as React from "react";
// import FormLoader from "../../common/FormLoader";

class CouponCodeWidget extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            
        }
    }
    redeem() {
        console.log(this.props);
    }
    render() {
        const { id, value, required, onChange } = this.props;
        return (
            <div className="col-12 p-0">
                <input
                    type="string"
                    className="form-control"
                    title="Coupon code"
                    id={id}
                    value={value}
                    required={required}
                    onChange={(event) => onChange(event.target.value)}
                />
                {
                    /*<button type="button" className="btn btn-sm col-6" onClick={() => this.redeem()}> Redeem</button>*/
                }
        </div>
        );
    }
};
export default CouponCodeWidget;