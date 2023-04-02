import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  Filter,
  TextInput,
} from "react-admin";

const ListFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Id" source="id" />
    <TextInput label="Batch" source="batch" />
    <TextInput label="Address" source="address" />
  </Filter>
);

const AccountsList = (props) => (
  <List {...props} filters={<ListFilter />}>
    <Datagrid>
      <TextField source="address" />
      <NumberField source="totalClaimed" />
      <NumberField source="totalLocked" />
      <NumberField source="availableToBeClaimed" />
    </Datagrid>
  </List>
);

export default AccountsList;
