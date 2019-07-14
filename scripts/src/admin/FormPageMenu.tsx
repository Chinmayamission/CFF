import React from "react";
import { Link } from "react-router-dom";

function FormPageMenu({
  formId,
  ItemComponent = props => <div>{props.children}</div>
}) {
  function Item({ icon, to, text }) {
    return (
      <Link to={to}>
        <ItemComponent>
          <span className={icon} style={{ marginRight: 10 }} />
          {text}
        </ItemComponent>
      </Link>
    );
  }
  return (
    <div>
      <Item icon="oi oi-pencil" text="Edit" to={`/admin/${formId}/edit/`} />
      <Item icon="oi oi-document" text="View" to={`/v2/forms/${formId}/`} />
      <Item icon="oi oi-document" text="Embed" to={`/admin/${formId}/embed/`} />
      <Item
        icon="oi oi-document"
        text="Responses"
        to={`/admin/${formId}/responses/`}
      />
      <Item
        icon="oi oi-share-boxed"
        text="Share"
        to={`/admin/${formId}/share/`}
      />
      <Item
        icon="oi oi-sort-ascending"
        text="Checkin"
        to={`/admin/${formId}/checkin/`}
      />
    </div>
  );
}
export default FormPageMenu;
