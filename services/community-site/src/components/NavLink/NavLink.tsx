import { NavLink as Link, NavLinkProps as LinkProps } from 'react-router-dom';
import './navlink.scss';

interface NavLinkProps extends LinkProps {
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  label: string;
  subItem?: boolean;
}

const NavLink = ({ Icon, label, to, ...props }: NavLinkProps) => {

  const exact = to === '/';
  return (
    <Link className="link" to={to} exact={exact} {...props}>
      <div className="navlink">
        {Icon && <Icon />}
        <span>{label}</span>
      </div>
    </Link>
  );
};

export default NavLink;
