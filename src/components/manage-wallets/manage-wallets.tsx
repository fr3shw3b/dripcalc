import { Button, Card, Elevation } from "@blueprintjs/core";
import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../store/types";
import MomentDate from "../moment-date";
import ContentContext from "../../contexts/content";
import WalletEditor from "../wallet-editor";

import "./manage-wallets.css";
import { nanoid } from "nanoid";
import { addWallet, updateWallet } from "../../store/actions/plans";
import FeatureTogglesContext from "../../contexts/feature-toggles";

type EditorState = {
  isOpen: boolean;
  action: string;
  walletId: string | null;
};

function ManageWallets() {
  const dispatch = useDispatch();
  const { wallets: walletsContent } = useContext(ContentContext);
  const featureToggles = useContext(FeatureTogglesContext);
  const { wallets, currentPlanId } = useSelector((state: AppState) => {
    const currentLocalPlanId = state.plans.current;
    const currentPlan = state.plans.plans.find(
      (plan) => plan.id === currentLocalPlanId
    );
    return {
      wallets: currentPlan?.wallets ?? [],
      currentPlanId: currentLocalPlanId,
    };
  });

  const [editorState, setEditorState] = useState<EditorState>({
    isOpen: false,
    action: "create",
    walletId: null,
  });
  const [editorWalletName, setEditorWalletName] = useState("");
  const [editorWalletDate, setEditorWalletDate] = useState(new Date());
  const [editorWalletAddress, setEditorWalletAddress] = useState("");

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

  const handleEditorWalletAddressChange = (walletAddress: string) => {
    setEditorWalletAddress(walletAddress);
  };

  const handleEditorWalletDateChange = (selectedDate: Date) => {
    setEditorWalletDate(selectedDate);
  };

  const handleEditorSaveClick = (id?: string | null) => {
    if (!id || editorState.action === "create") {
      dispatch(
        addWallet(
          nanoid(),
          currentPlanId,
          editorWalletName,
          editorWalletDate.getTime(),
          editorWalletAddress
        )
      );
    } else {
      dispatch(
        updateWallet(
          id,
          currentPlanId,
          editorWalletName,
          editorWalletDate.getTime(),
          editorWalletAddress
        )
      );
    }

    setEditorState({
      isOpen: false,
      action: "create",
      walletId: null,
    });
  };

  const handleEditWalletClick = (walletId: string) => {
    return () => {
      const wallet = wallets.find(
        ({ id: currentId }) => currentId === walletId
      );
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
  };

  const handleEditorClose = () => {
    setEditorState({
      isOpen: false,
      action: "create",
      walletId: null,
    });
  };

  return (
    <div className="manage-wallets">
      <div className="manage-wallets-cards">
        {wallets.map((wallet) => {
          return (
            <Card
              key={wallet.id}
              interactive
              elevation={Elevation.TWO}
              className="manage-wallets-card"
              onClick={handleEditWalletClick(wallet.id)}
            >
              <h3 className="manage-wallets-card-title">{wallet.label}</h3>
              {featureToggles.walletAddressTransactions && (
                <div className="manage-wallets-card-info-item">
                  <div className="manage-wallets-card-info-item-label">
                    <strong>Address</strong>
                  </div>
                  {wallet?.address ?? "No address attached"}
                </div>
              )}
              <div className="manage-wallets-card-info-item">
                <div className="manage-wallets-card-info-item-label">
                  <strong>Start Date</strong>
                </div>
                <MomentDate date={new Date(wallet.startDate)} />
              </div>
              <div className="manage-wallets-card-info-item">
                <Button
                  icon="edit"
                  onClick={handleEditWalletClick(wallet.id)}
                />
              </div>
            </Card>
          );
        })}
      </div>
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
        walletAddress={editorWalletAddress}
        onWalletAddressChange={handleEditorWalletAddressChange}
        walletDate={editorWalletDate}
        onWalletDateChange={handleEditorWalletDateChange}
        onSaveClick={handleEditorSaveClick}
        onClose={handleEditorClose}
        title={
          editorState.action === "edit"
            ? `Edit "${editorWalletName}"`
            : undefined
        }
      />
    </div>
  );
}

export default ManageWallets;
