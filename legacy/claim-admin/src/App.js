import React from "react";
import { Admin, Resource } from "react-admin";

import MonetizationOnIcon from "@material-ui/icons/MonetizationOn";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import AllInboxIcon from "@material-ui/icons/AllInbox";
import ArchiveIcon from "@material-ui/icons/Archive";
import { createMuiTheme } from "@material-ui/core/styles";

import data from "./services/data";
import authProvider from "./services/auth";
import rewards from "./resources/rewards";
import batches from "./resources/batches";
import accounts from "./resources/accounts";
import claims from "./resources/claims";

const theme = createMuiTheme({
  palette: {
    type: "light",
  },
});

const App = () => (
  <Admin
    authProvider={authProvider}
    dataProvider={data}
    theme={theme}
    disableTelemetry
  >
    <Resource name="batches" icon={AllInboxIcon} {...batches} />
    <Resource name="rewards" icon={MonetizationOnIcon} {...rewards} />
    <Resource name="accounts" icon={AccountBalanceIcon} {...accounts} />
    <Resource name="claims" icon={ArchiveIcon} {...claims} />
  </Admin>
);

export default App;
