import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  ReferenceField,
  Filter,
  TextInput,
  BooleanInput,
  Button,
  Link,
} from "react-admin";

const ListFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Address" source="address" />
    <TextInput label="BatchId" source="batch.id" />
    <BooleanInput label="Unlocked" source="isUnlocked" />
  </Filter>
);

const LinkToRelatedBatch = ({ record }) => {
  if (!record) {
    return null;
  }
  return (
    <Button
      color="primary"
      component={Link}
      to={{
        pathname: "/batches",
        search: `filter=${JSON.stringify({ id: record.id })}`,
      }}
    >
      <>{record.name}</>
    </Button>
  );
};

const LinkToRelatedAccount = ({ record }) => {
  if (!record) {
    return null;
  }
  return (
    <Button
      color="primary"
      component={Link}
      to={{
        pathname: "/accounts",
        search: `filter=${JSON.stringify({ id: record.id })}`,
      }}
    >
      <>{record.address}</>
    </Button>
  );
};

const RewardsList = (props) => (
  <List {...props} filters={<ListFilter />}>
    <Datagrid>
      <ReferenceField label="Batch" source="batch.id" reference="batches">
        <LinkToRelatedBatch />
      </ReferenceField>
      <ReferenceField label="Address" source="account.id" reference="accounts">
        <LinkToRelatedAccount />
      </ReferenceField>
      <TextField source="numberOfTokens" />
      <DateField source="unlockDate" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
      <BooleanField
        source="isUnlocked"
        valueLabelTrue="1"
        valueLabelFalse="0"
      />
    </Datagrid>
  </List>
);

export default RewardsList;
