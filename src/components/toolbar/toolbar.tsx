import {
  Button,
  InputGroup,
  MenuItem,
  Navbar,
  Position,
} from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { Select } from "@blueprintjs/select";
import { nanoid } from "nanoid";
import {
  ChangeEventHandler,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import useMobileCheck from "../../hooks/use-mobile-check";
import { cleanAllData } from "../../store/actions/general";
import {
  refreshCalculations,
  selectPlan,
  updatePlanLabel,
} from "../../store/actions/plans";

import { PlanState } from "../../store/reducers/plans";
import { AppState } from "../../store/types";

import "./toolbar.css";

type PlanLite = Pick<PlanState, "id" | "label">;
const PlanSelect = Select.ofType<PlanLite>();

function Toolbar() {
  const isMobile = useMobileCheck();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { plans, currentPlanLabel, currentPlanIndex, currentPlanId } =
    useSelector((state: AppState) => {
      const currentPlan = state.plans.current;
      const planIndex = state.plans.plans.findIndex(
        (plan) => plan.id === state.plans.current
      );
      return {
        ...state.views[currentPlan],
        currentPlanId: currentPlan,
        plans: state.plans.plans.map(({ id, label }) => ({ id, label })),
        currentPlanLabel: state.plans.plans[planIndex]?.label,
        currentPlanIndex: planIndex,
      };
    });

  const [showEditPlanLabel, setShowEditPlanLabel] = useState(false);
  const [isToolbarExpanded, setToolbarExpanded] = useState(true);

  const editPlanLabelInputRef = useRef<HTMLInputElement>(null);

  const handleNavButtonClick: (path: string) => MouseEventHandler =
    (path) => (evt) => {
      evt.preventDefault();
      navigate(path);
    };

  const handlePlanSelect = (plan: PlanLite) => {
    dispatch(selectPlan(plan.id, plan.label));
  };

  const handleCurrentPlanLabelChange: ChangeEventHandler<HTMLInputElement> = (
    evt
  ) => {
    dispatch(updatePlanLabel(currentPlanId, evt.target.value));
  };

  const handleEditPlanLabelClick = (
    evt: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    evt.preventDefault();
    setShowEditPlanLabel(true);
  };

  useEffect(() => {
    if (showEditPlanLabel && editPlanLabelInputRef.current) {
      editPlanLabelInputRef.current.focus();
    }
  }, [showEditPlanLabel]);

  const handleCloseEditPlanLabelClick = (
    evt: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    evt.preventDefault();
    setShowEditPlanLabel(false);
  };

  const handleRefreshClick = (
    evt: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    evt.preventDefault();
    dispatch(refreshCalculations(currentPlanId));
  };

  const handleCleanDataClick = (
    evt: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    evt.preventDefault();
    dispatch(cleanAllData());
  };

  const handleCollapseExpandClick = (
    evt: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    evt.preventDefault();
    setToolbarExpanded((prevState) => !prevState);
  };

  const { currentArea, currentAreaPathPrefix } = getCurrentArea(
    location.pathname
  );
  return (
    <div className={`toolbar ${isToolbarExpanded ? "expanded" : "collapsed"}`}>
      <div className="contents">
        {!isMobile && location.pathname !== "/" && (
          <>
            {" "}
            <Button
              className="bp3-minimal menu-item"
              icon="home"
              text={`${currentArea} dashboard`}
              active={
                location.pathname === `${currentAreaPathPrefix}/dashboard`
              }
              onClick={handleNavButtonClick(
                `${currentAreaPathPrefix}/dashboard`
              )}
            />
            <Button
              className="bp3-minimal menu-item"
              icon="info-sign"
              text="information"
              active={
                location.pathname === `${currentAreaPathPrefix}/information`
              }
              onClick={handleNavButtonClick(
                `${currentAreaPathPrefix}/information`
              )}
            />
            <Navbar.Divider className="menu-item-divider" />
          </>
        )}

        <PlanSelect
          items={plans}
          itemRenderer={(item: PlanLite, { handleClick, modifiers, query }) => {
            if (!modifiers.matchesPredicate) {
              return null;
            }

            return (
              <MenuItem
                active={modifiers.active}
                disabled={modifiers.disabled}
                key={item.id}
                onClick={handleClick}
                text={highlightText(item.label, query)}
              />
            );
          }}
          activeItem={plans[currentPlanIndex]}
          onItemSelect={handlePlanSelect}
          noResults={<MenuItem disabled={true} text="No plans." />}
          filterable
          createNewItemFromQuery={(title: string): PlanLite => {
            return {
              label: title,
              id: nanoid(),
            };
          }}
          itemPredicate={(query, plan, _index, exactMatch) => {
            const normalizedTitle = plan.label.toLowerCase();
            const normalizedQuery = query.toLowerCase();

            if (exactMatch) {
              return normalizedTitle === normalizedQuery;
            } else {
              return normalizedTitle.indexOf(normalizedQuery) >= 0;
            }
          }}
          createNewItemRenderer={(
            query: string,
            active: boolean,
            handleClick: React.MouseEventHandler<HTMLElement>
          ) => {
            return (
              <MenuItem
                icon="add"
                text={`Create "${query}"`}
                active={active}
                onClick={handleClick}
                shouldDismissPopover={false}
              />
            );
          }}
        >
          <Button text={currentPlanLabel} rightIcon="double-caret-vertical" />
        </PlanSelect>
        <form onSubmit={(evt) => evt.preventDefault()}>
          <InputGroup
            id="current-plan-label"
            className={`inline-field edit-plan-label${
              showEditPlanLabel ? " show" : ""
            }`}
            type="text"
            asyncControl={true}
            rightElement={
              <Button icon="cross" onClick={handleCloseEditPlanLabelClick} />
            }
            placeholder="Enter minimum value"
            value={currentPlanLabel}
            onChange={handleCurrentPlanLabelChange}
            inputRef={editPlanLabelInputRef}
          />
          {!showEditPlanLabel && (
            <Tooltip2
              content={`Edit "${currentPlanLabel}" label`}
              position={Position.BOTTOM}
              openOnTargetFocus={false}
            >
              <Button
                icon="edit"
                className="navbar-edit"
                onClick={handleEditPlanLabelClick}
              />
            </Tooltip2>
          )}
          <Tooltip2
            content={`Refresh ALL "${currentPlanLabel}" calculations`}
            position={Position.BOTTOM}
            openOnTargetFocus={false}
          >
            <Button
              icon="refresh"
              className="navbar-edit"
              onClick={handleRefreshClick}
            />
          </Tooltip2>
          <Tooltip2
            content={`Clean all data! (This will clean out the browser storage that stores ALL your dripcalc data)`}
            position={Position.BOTTOM}
            openOnTargetFocus={false}
          >
            <Button
              icon="clean"
              className="navbar-clean-data"
              onClick={handleCleanDataClick}
            />
          </Tooltip2>
        </form>
      </div>
      <Tooltip2
        content={`${isToolbarExpanded ? "Collapse" : "Expand"} toolbar`}
        position={Position.BOTTOM}
        openOnTargetFocus={false}
      >
        <Button
          icon={isToolbarExpanded ? "chevron-left" : "chevron-right"}
          className="navbar-collapse-button bp3-minimal"
          onClick={handleCollapseExpandClick}
        />
      </Tooltip2>
    </div>
  );
}

function highlightText(text: string, query: string) {
  let lastIndex = 0;
  const words = query
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map(escapeRegExpChars);
  if (words.length === 0) {
    return [text];
  }
  const regexp = new RegExp(words.join("|"), "gi");
  const tokens: React.ReactNode[] = [];
  while (true) {
    const match = regexp.exec(text);
    if (!match) {
      break;
    }
    const length = match[0].length;
    const before = text.slice(lastIndex, regexp.lastIndex - length);
    if (before.length > 0) {
      tokens.push(before);
    }
    lastIndex = regexp.lastIndex;
    tokens.push(<strong key={lastIndex}>{match[0]}</strong>);
  }
  const rest = text.slice(lastIndex);
  if (rest.length > 0) {
    tokens.push(rest);
  }
  return tokens;
}

function escapeRegExpChars(text: string) {
  return text.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
}

function getCurrentArea(path: string): {
  currentArea: string;
  currentAreaPathPrefix: string;
} {
  if (path.startsWith("/faucet")) {
    return {
      currentArea: "faucet",
      currentAreaPathPrefix: "/faucet",
    };
  }

  if (path.startsWith("/drip-garden")) {
    return {
      currentArea: "garden",
      currentAreaPathPrefix: "/drip-garden",
    };
  }

  return {
    currentArea: "farm",
    currentAreaPathPrefix: "/animal-farm",
  };
}

export default Toolbar;
