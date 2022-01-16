import React from "react";
import { Popover2 } from "@blueprintjs/popover2";
import { Button } from "@blueprintjs/core";

import "./help.css";

type Props = {
  helpContent: string | JSX.Element;
  children: React.ReactNode;
};

function Help({ children, helpContent }: Props) {
  return (
    <div className="help-container">
      <div className="help-content">{children}</div>
      <div className="help-button-wrapper">
        <Popover2
          content={helpContent}
          placement="bottom"
          usePortal={false}
          modifiers={{
            arrow: { enabled: true },
            flip: { enabled: true },
            preventOverflow: { enabled: true },
          }}
        >
          <Button icon="info-sign" small />
        </Popover2>
      </div>
    </div>
  );
}

export default Help;
