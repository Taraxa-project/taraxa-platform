import React from 'react';
import theme from '../theme';
import { BottomNavigationActionProps as MBottomNavigationActionProps, CssBaseline, ThemeProvider } from '@material-ui/core';
import Text from '../Text';
import useStyles from './footer-styles';
import { useMediaQuery } from 'react-responsive';
import logo from '../../images/logo.svg';


export interface FooterProps extends MBottomNavigationActionProps {
  items: { label: string; Icon: JSX.Element }[];
  description?: string;
  links?: { link: string; label: string; }[];
};

const Footer = ({
  items,
  description,
  links,
}: FooterProps) => {
  const classes = useStyles();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={isMobile ? classes.footerMobile : classes.footer}>
        <div className={isMobile ? classes.logoMobile : classes.logo}>
          <div className={isMobile ? classes.footerSVGMobile : classes.footerSVG}><img src={logo} alt="Taraxa" /></div>
          {items && !isMobile && <ul className={classes.footerUl}>
            {items.map((item) => (
              <li key={item.label} className={classes.footerLi}>{item.Icon}</li>
            ))}
          </ul>
          }
        </div>
        {description && <div className={isMobile ? classes.descriptionMobile : classes.description}>
          <Text label={description} variant="body1" color="textSecondary" style={{ textAlign: 'left' }} />
        </div>}
        {isMobile && items && <div className={classes.mobileIcons}>
          <ul className={classes.mobileFooterUL}>
            {items.map((item) => (
              <li key={item.label} className={classes.footerLi}>{item.Icon}</li>
            ))}
          </ul>
        </div>
        }
        {links &&
          <div className={classes.footerList}>
            {links.map(link => (
              <a key={link.label} href={link.link} target="_blank" className={classes.footerParagraph}>
                <Text label={link.label} variant="body1" color="textSecondary" />
              </a>
            ))}
          </div>
        }
      </div>
    </ThemeProvider>
  )
}

export default Footer;