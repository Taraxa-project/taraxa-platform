import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  Filter,
  TextInput,
  BooleanInput,
  Button,
  Link,
} from "react-admin";

const ListFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Address" source="address" />
    <BooleanInput label="Claimed" source="claimed" />
  </Filter>
);

const LinkToRelatedAccount = ({ record, children }) => {
  console.log(record);
  if (!record) {
    return null;
  }
  return (
    <Button
      color="primary"
      component={Link}
      to={{
        pathname: "/accounts",
        search: `filter=${JSON.stringify({ address: record.address })}`,
      }}
    >
      <>{record.address}</>
    </Button>
  );
};

const ClaimsList = (props) => (
  <List {...props} filters={<ListFilter />}>
    <Datagrid>
      <LinkToRelatedAccount />
      <TextField source="numberOfTokens" />
      <DateField source="createdAt" />
      <BooleanField source="claimed" valueLabelTrue="1" valueLabelFalse="0" />
    </Datagrid>
  </List>
);

export default ClaimsList;
