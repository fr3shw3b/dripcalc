import {
  Dialog,
  Classes,
  FormGroup,
  InputGroup,
  Button,
} from "@blueprintjs/core";
import { DatePicker } from "@blueprintjs/datetime";
import React, { useContext } from "react";

import MomentDate from "../moment-date";
import ContentContext from "../../contexts/content";
import ConfigContext from "../../contexts/config";

type Props = {
  walletName: string;
  onWalletNameFieldChange: (walletName: string) => void;
  walletDate: Date;
  onWalletDateChange: (date: Date) => void;
  isOpen: boolean;
  onClose: (evt: React.SyntheticEvent<HTMLElement, Event>) => void | undefined;
  onSaveClick: (id?: string | null) => void;
  title?: string;
  walletId?: string | null;
};

function WalletEditor({
  isOpen,
  walletName,
  onWalletNameFieldChange,
  walletDate,
  onWalletDateChange,
  onClose,
  title,
  onSaveClick,
  walletId,
}: Props) {
  const { wallets: walletsContent } = useContext(ContentContext);
  const { minWalletStartDate, maxWalletStartDate } = useContext(ConfigContext);

  const handleAddNewWalletNameFieldChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (evt) => {
    evt.preventDefault();
    onWalletNameFieldChange(evt.currentTarget.value);
  };

  const handleSaveClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onSaveClick(walletId);
  };

  return (
    <>
      <Dialog
        title={title ?? walletsContent.createNewWalletTitle}
        isOpen={isOpen}
        className="bp3-dark"
        onClose={onClose}
      >
        <div className={Classes.DIALOG_BODY}>
          <form onSubmit={(evt) => evt.preventDefault()}>
            <FormGroup
              label={walletsContent.newWalletNameFieldLabel}
              labelFor="new-wallet-name"
            >
              <InputGroup
                id="new-wallet-name"
                type="text"
                asyncControl={true}
                placeholder="Wallet name"
                value={walletName}
                onChange={handleAddNewWalletNameFieldChange}
              />
            </FormGroup>
            <FormGroup
              label={walletsContent.newWalletDateFieldName}
              helperText={walletsContent.newWalletDateHelpText}
            >
              <DatePicker
                className={Classes.ELEVATION_1}
                onChange={onWalletDateChange}
                defaultValue={walletDate}
                minDate={new Date(minWalletStartDate)}
                maxDate={new Date(maxWalletStartDate)}
              />
              <div className="block">
                <MomentDate date={walletDate} />
              </div>
            </FormGroup>
          </form>
        </div>
        <DialogFooter
          onClose={onClose}
          canSave={walletName.length > 0}
          onSaveClick={handleSaveClick}
        />
      </Dialog>
    </>
  );
}

function DialogFooter(props: {
  onClose: (e: React.SyntheticEvent<HTMLElement, Event>) => void | undefined;
  canSave: boolean;
  onSaveClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div className={Classes.DIALOG_FOOTER}>
      <div className={Classes.DIALOG_FOOTER_ACTIONS}>
        <Button onClick={props.onClose}>Close</Button>
        <Button
          intent="primary"
          disabled={!props.canSave}
          onClick={props.onSaveClick}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export default WalletEditor;
