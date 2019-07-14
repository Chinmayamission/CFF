import { IResponseDetailProps, IResponseDetailState } from "./ResponseDetail.d";
import ReactJson from "react-json-view";
import * as React from "react";
import { API } from "aws-amplify";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "./ResponseDetail.scss";
import ValueEdit from "./ResponseCards/ValueEdit";
import { connect } from "react-redux";
import { setResponseDetail } from "../../store/responses/actions";
import PaymentHistory from "./ResponseCards/PaymentHistory";
import { fetchResponseDetail } from "../../store/responses/actions";

class ResponseDetail extends React.Component<
  IResponseDetailProps,
  IResponseDetailState
> {
  constructor(props: any) {
    super(props);
  }
  componentDidMount() {
    this.props.fetchResponseDetail(this.props.responseId);
  }
  sendConfirmationEmail() {
    API.post(
      "CFF",
      `responses/${this.props.responseId}/sendConfirmationEmail`,
      {
        body: {
          // "paymentMethod": "manualApproval"
        }
      }
    )
      .then(e => {
        alert("Confirmation email sent!");
      })
      .catch(e => {
        alert(`Response update failed: ${e}`);
      });
  }
  delete() {
    if (
      confirm(
        "Are you sure you want to delete this response (this cannot be undone)?"
      )
    ) {
      API.del("CFF", `responses/${this.props.responseData._id.$oid}`, {})
        .then(e => {
          alert("Response deleted!");
          window.location.reload();
          this.props.setResponseDetail(null);
        })
        .catch(e => {
          alert(`Response delete failed: ${e}`);
        });
    }
  }
  render() {
    if (!this.props.responseData) {
      return <div>Loading...</div>;
    }
    return (
      <div
        className="container-fluid cff-response-detail"
        key={this.props.responseData._id.$oid}
      >
        <Tabs>
          <TabList>
            <Tab>Payment history</Tab>
            <Tab>Response Value</Tab>
            <Tab>Actions</Tab>
            <Tab>Inspector (advanced)</Tab>
          </TabList>
          <TabPanel>
            <PaymentHistory />
          </TabPanel>
          <TabPanel>
            <ValueEdit />
          </TabPanel>

          <TabPanel>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => this.sendConfirmationEmail()}
            >
              Send confirmation email
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => this.delete()}
            >
              Delete response forever
            </button>
          </TabPanel>
          <TabPanel>
            <ReactJson
              src={this.props.responseData}
              displayObjectSize={false}
              displayDataTypes={false}
              onEdit={false}
              onAdd={false}
              onDelete={false}
              collapsed={0}
              style={{ fontFamily: "Arial, sans-serif", marginLeft: "30px" }}
            />
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}

// export default ResponseDetail;

const mapStateToProps = state => ({
  ...state.responses
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResponseDetail: e => dispatch(fetchResponseDetail(e)),
  setResponseDetail: e => dispatch(setResponseDetail(e))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResponseDetail);
