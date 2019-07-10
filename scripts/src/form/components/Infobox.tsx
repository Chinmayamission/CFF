import React from "react";
import sanitize from "../../sanitize";
import { Popover, PopoverBody } from "reactstrap";

class Infobox extends React.Component<
  { i: string; description: string },
  { open: boolean }
> {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  setOpen(open) {
    this.setState({ open });
  }

  render() {
    const { i, description } = this.props;
    if (!description) {
      return null;
    }
    return (
      <div
        style={{ display: "inline-block" }}
        id={"Popover-container" + i}
        onMouseOver={e => this.setOpen(true)}
        onMouseLeave={event => {
          if (event.relatedTarget) {
            let element = event.relatedTarget as HTMLDivElement;
            if (
              element.id === "Popover-body" + i ||
              element.className === "arrow" ||
              element.className === "popover-body"
            ) {
              return;
            }
          }
          this.state.open && this.setOpen(false);
        }}
      >
        <img
          width={15}
          height={15}
          src="https://www.freeiconspng.com/uploads/cute-ball-info-icon--i-like-buttons-3a-iconset--mazenl77-8.png"
          id={"Popover" + i}
          style={{ marginLeft: 10 }}
        />
        <Popover
          placement="right"
          isOpen={this.state.open}
          container={"#" + "Popover-container" + i}
          target={"Popover" + i}
        >
          <PopoverBody>
            <div
              id={"Popover-body" + i}
              dangerouslySetInnerHTML={{ __html: sanitize(description || "") }}
            />
          </PopoverBody>
        </Popover>
      </div>
    );
  }
}
export default Infobox;
