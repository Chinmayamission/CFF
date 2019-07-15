import React from "react";
import CustomForm from "../../form/CustomForm";
import { IGroupOption, IDataOptionView } from "../FormEdit/FormEdit.d";

interface IGroupEditProps {
  groupOption: IGroupOption;
  dataOptionView: IDataOptionView;
  onSubmit: (id: string, e: any) => void;
}

export default (props: IGroupEditProps) => {
  return (
    <CustomForm
      schema={{
        title: props.dataOptionView.displayName,
        type: "array",
        minItems: 1,
        items: props.groupOption.schema
      }}
      uiSchema={{}}
      formData={props.groupOption.data}
      onSubmit={e => props.onSubmit(props.groupOption.id, e.formData)}
    />
  );
};
