import { Tab, Tabs, Button } from "@blueprintjs/core";
import { nanoid } from "nanoid";

import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ContentContext from "../../contexts/content";
import {
  addWallet,
  updateCurrentWallet,
  updateWallet,
} from "../../store/actions/wallets";
import { AppState } from "../../store/types";

import WalletView from "../wallet-view";
import WalletEditor from "../wallet-editor";

import "./wallets-panel.css";

type EditorState = {
  isOpen: boolean;
  action: string;
  walletId: string | null;
};

function WalletsPanel() {
  const [editorState, setEditorState] = useState<EditorState>({
    isOpen: false,
    action: "create",
    walletId: null,
  });
  const [editorWalletName, setEditorWalletName] = useState("");
  const [editorWalletDate, setEditorWalletDate] = useState(new Date());
  const dispatch = useDispatch();
  const { wallets, current } = useSelector((state: AppState) => state.wallets);
  const { wallets: walletsContent } = useContext(ContentContext);

  const handleWalletChange = (newTabId: string) => {
    dispatch(updateCurrentWallet(newTabId));
  };

  const handleClose = () => {
    setEditorState({
      isOpen: false,
      action: "create",
      walletId: null,
    });
  };

  const handleAddNewWalletClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    setEditorWalletName("");
    setEditorWalletDate(new Date());
    setEditorState({
      isOpen: true,
      action: "create",
      walletId: null,
    });
  };

  const handleEditorWalletNameChange = (walletName: string) => {
    setEditorWalletName(walletName);
  };

  const handleEditorWalletDateChange = (selectedDate: Date) => {
    setEditorWalletDate(selectedDate);
  };

  const handleSaveClick = (id?: string | null) => {
    if (!id || editorState.action === "create") {
      dispatch(
        addWallet(nanoid(), editorWalletName, editorWalletDate.getTime())
      );
    } else {
      dispatch(updateWallet(id, editorWalletName, editorWalletDate.getTime()));
    }

    setEditorState({
      isOpen: false,
      action: "create",
      walletId: null,
    });
  };

  const handleEditWalletClick = (walletId: string) => {
    const wallet = wallets.find(({ id: currentId }) => currentId === walletId);
    if (wallet) {
      setEditorWalletName(wallet.label);
      setEditorWalletDate(new Date(wallet.startDate));
    }
    setEditorState({
      isOpen: true,
      action: "edit",
      walletId,
    });
  };

  return (
    <>
      <Tabs
        id="walletTabs"
        onChange={handleWalletChange}
        vertical
        selectedTabId={current}
      >
        {wallets.map(({ id, label, startDate, monthInputs }) => (
          <Tab
            key={id}
            id={id}
            title={label}
            panel={
              <WalletView
                walletId={id}
                label={label}
                startDate={startDate}
                monthInputs={monthInputs}
                onEditClick={handleEditWalletClick}
              />
            }
          />
        ))}
        <Tabs.Expander />
        <Button
          className="wallet-tabs-add-new"
          icon="plus"
          onClick={handleAddNewWalletClick}
        >
          {walletsContent.createNewWalletButtonText}
        </Button>
        <WalletEditor
          walletId={editorState.walletId}
          isOpen={editorState.isOpen}
          walletName={editorWalletName}
          onWalletNameFieldChange={handleEditorWalletNameChange}
          walletDate={editorWalletDate}
          onWalletDateChange={handleEditorWalletDateChange}
          onSaveClick={handleSaveClick}
          onClose={handleClose}
          title={
            editorState.action === "edit"
              ? `Edit "${editorWalletName}"`
              : undefined
          }
        />
      </Tabs>
    </>
  );
}

export default WalletsPanel;
