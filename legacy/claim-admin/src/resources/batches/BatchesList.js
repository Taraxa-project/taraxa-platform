import * as React from "react";
import { cloneElement } from "react";
import {
  List,
  Datagrid,
  TextField,
  SelectField,
  DateField,
  useListContext,
  TopToolbar,
  CreateButton,
  sanitizeListRestProps,
  Filter,
  Button,
  Link,
  TextInput,
} from "react-admin";
import constants from "../../constants";

const ListFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Id" source="id" />
    <TextInput label="Name" source="name" />
  </Filter>
);

const ListActions = (props) => {
  const { className, exporter, filters, maxResults, ...rest } = props;
  const {
    resource,
    displayedFilters,
    filterValues,
    basePath,
    showFilter,
  } = useListContext();
  return (
    <TopToolbar className={className} {...sanitizeListRestProps(rest)}>
      {filters &&
        cloneElement(filters, {
          resource,
          showFilter,
          displayedFilters,
          filterValues,
          context: "button",
        })}
      <CreateButton basePath={basePath} />
    </TopToolbar>
  );
};

const LinkToRelatedRewards = ({ record }) => {
  if (!record) {
    return null;
  }
  return (
    <Button
      color="primary"
      component={Link}
      to={{
        pathname: "/rewards",
        search: `filter=${JSON.stringify({ batch: { id: record.id } })}`,
      }}
    >
      <>Rewards</>
    </Button>
  );
};

const LinkToAccounts = ({ record }) => {
  if (!record) {
    return null;
  }
  return (
    <Button
      color="primary"
      component={Link}
      to={{
        pathname: "/accounts",
        search: `filter=${JSON.stringify({ batch: record.id })}`,
      }}
    >
      <>Accounts</>
    </Button>
  );
};

const BatchesList = (props) => (
  <List {...props} actions={<ListActions />} filters={<ListFilter />}>
    <Datagrid>
      <TextField source="name" />
      <SelectField source="type" choices={constants.batchTypes} />
      <DateField source="createdAt" />
      <LinkToRelatedRewards />
      <LinkToAccounts />
    </Datagrid>
  </List>
);

export default BatchesList;
