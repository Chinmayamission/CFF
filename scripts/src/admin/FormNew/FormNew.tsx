import * as React from "react";
import { API } from "aws-amplify";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import "./FormNew.scss";
import { IFormNewProps } from "./FormNew.d";
import { createForm } from "../../store/admin/actions";
import { connect } from "react-redux";

class FormNew extends React.Component<
  IFormNewProps,
  { dropdownOpen: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      dropdownOpen: false
    };
  }
  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }
  componentDidMount() {}
  render() {
    return (
      <Dropdown isOpen={this.state.dropdownOpen} toggle={() => this.toggle()}>
        <DropdownToggle caret>Create form</DropdownToggle>
        <DropdownMenu>
          <DropdownItem onClick={() => this.props.createForm()}>
            Blank
          </DropdownItem>
          {/* <DropdownItem>Balavihar</DropdownItem>
          <DropdownItem>Camp Registration</DropdownItem>
          <DropdownItem>Walkathon</DropdownItem> */}
        </DropdownMenu>
      </Dropdown>
    );
  }
}

const mapStateToProps = state => ({
  ...state.admin
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  createForm: e => dispatch(createForm(e))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FormNew);
