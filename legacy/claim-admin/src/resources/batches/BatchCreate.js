import * as React from "react";
import {
  Create,
  SimpleForm,
  FileInput,
  FileField,
  SelectInput,
  TextInput,
} from "react-admin";
import constants from "../../constants";

export const BatchCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput isRequired={true} source="name" />
      <SelectInput
        isRequired={true}
        source="type"
        choices={constants.batchTypes}
      />
      <FileInput
        isRequired={true}
        multiple={false}
        source="file"
        label="CSV Import"
        options={{accept: ["text/plain", "text/csv", "application/vnd.ms-excel"]}}
      >
        <FileField source="src" title="title" />
      </FileInput>
    </SimpleForm>
  </Create>
);
