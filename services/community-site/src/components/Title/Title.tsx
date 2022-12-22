import React from "react";
import { Text, Tooltip } from "@taraxa_project/taraxa-ui";

import InfoIcon from "../../assets/icons/info";

import "./title.scss";

interface TitleProps {
  title: string;
  subtitle?: string | JSX.Element;
  tooltip?: string;
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  size?: "default" | "medium";
}

const Title = ({ title, subtitle, tooltip, Icon, size }: TitleProps) => {
  return (
    <div className="page-title">
      <div className="page-title-container">
        {Icon && (
          <div className="page-title-icon">
            <Icon />
          </div>
        )}
        <Text
          variant="h1"
          color="primary"
          className={
            size === "medium" ? "page-medium-title-main" : "page-title-main"
          }
        >
          {title}
          {tooltip && (
            <Tooltip
              className="page-title-tooltip"
              title={tooltip}
              Icon={InfoIcon}
            />
          )}
        </Text>
      </div>
      {subtitle && typeof subtitle === "string" && (
        <Text
          label={subtitle}
          variant="body2"
          color="textSecondary"
          className="page-title-subtitle"
        />
      )}
      {subtitle && typeof subtitle !== "string" && (
        <div className="page-title-subtitle">{subtitle}</div>
      )}
    </div>
  );
};

export default Title;
