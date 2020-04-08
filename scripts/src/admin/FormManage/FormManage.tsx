import * as React from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import { Link } from "react-router-dom";
import "./FormManage.scss";
import { IFormManageProps } from "./FormManage.d";
import { createForm } from "../../store/admin/actions";
import { connect } from "react-redux";

class FormManage extends React.Component<
  IFormManageProps,
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
        <DropdownToggle caret>Manage</DropdownToggle>
        <DropdownMenu>
          <DropdownItem onClick={() => this.props.createForm()}>
            Create form
          </DropdownItem>
          <Link to={`/admin/org/org1/share/`} >
          <DropdownItem>
            
              Manage org
            
          </DropdownItem>
          </Link>
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
)(FormManage);
