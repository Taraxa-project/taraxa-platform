import React from "react";
import { CssBaseline, ThemeProvider, Typography, TypographyProps } from "@material-ui/core";
import useStyles from './modaltitle-styles';
import theme from "../theme";


export interface ModalTitleProps extends TypographyProps {
  title: string;
};

const ModalTitle = ({
  title,
}: ModalTitleProps) => {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Typography variant='body2' className={classes.root}>
          {title}
        </Typography>
    </ThemeProvider>
  );
};



export default ModalTitle;
