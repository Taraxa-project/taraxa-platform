import React from "react";
import { Footer as TFooter } from "@taraxa_project/taraxa-ui";
import SendIcon from "../../assets/icons/send";
import TwitterIcon from "../../assets/icons/twitter";
import DiscordIcon from "../../assets/icons/discord";

const Footer = () => {
  return (
    <TFooter
      description="Taraxa is a public ledger platform purpose-built for audit logging of informal transactions."
      links={[{ label: "Privacy Policy", link: "https://taraxa.io/privacy" }]}
      items={[
        {
          label: "Send",
          Icon: (
            <a href="https://www.taraxa.io/tg" target="_blank" rel="noreferrer">
              <SendIcon />
            </a>
          ),
        },
        {
          label: "Discord",
          Icon: (
            <a
              href="https://www.taraxa.io/discord"
              target="_blank"
              rel="noreferrer"
            >
              <DiscordIcon />
            </a>
          ),
        },
        {
          label: "Twitter",
          Icon: (
            <a
              href="https://www.taraxa.io/twitter"
              target="_blank"
              rel="noreferrer"
            >
              <TwitterIcon />
            </a>
          ),
        },
      ]}
    />
  );
};

export default Footer;
