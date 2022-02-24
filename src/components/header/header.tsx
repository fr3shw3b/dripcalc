import {
  Navbar,
  Alignment,
  Button,
  Icon,
  Position,
  Switch,
} from "@blueprintjs/core";
import { MouseEventHandler, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import FeatureTogglesContext from "../../contexts/feature-toggles";

import Toolbar from "../toolbar";
import useMobileCheck from "../../hooks/use-mobile-check";

import logo from "../../logo.svg";

import "./header.css";
import { AppState } from "../../store/types";
import formatCurrency from "../../utils/currency";
import { Tooltip2 } from "@blueprintjs/popover2";
import { toggleFiatMode } from "../../store/actions/general";

function Header() {
  const { isFirstTime, nativeDexDripPriceInCurrency, fiatMode, currency } =
    useSelector((state: AppState) => {
      const currentPlanId = state.plans.current;
      return {
        currency: state.settings[currentPlanId].currency,
        isFirstTime: state.general.isFirstTime,
        nativeDexDripPriceInCurrency: state.price.nativeDexDripPriceInCurrency,
        fiatMode: state.general.fiatMode,
      };
    });
  const featureToggles = useContext(FeatureTogglesContext);
  const [isMobileMenuExpanded, setMobileMenuExpanded] = useState(false);
  const isMobile = useMobileCheck();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isMobile) {
      setMobileMenuExpanded(false);
    }
  }, [isMobile, setMobileMenuExpanded]);

  const handleNavButtonClick: (path: string) => MouseEventHandler =
    (path) => (evt) => {
      evt.preventDefault();
      navigate(path);
      setMobileMenuExpanded(false);
    };

  const handleMenuIconClick: MouseEventHandler = (evt) => {
    evt.preventDefault();
    setMobileMenuExpanded((prevState) => !prevState);
  };

  const renderDesktopMenu = () => {
    return (
      <>
        <Navbar.Divider />
        <ul className="desktop-menu-list">
          <li>
            <Button
              className="bp3-minimal nav-item"
              icon="home"
              text="dashboard"
              active={location.pathname === "/"}
              onClick={handleNavButtonClick("/")}
            />
          </li>
          <li>
            <Button
              className="bp3-minimal nav-item"
              icon="tint"
              text="drip faucet"
              active={location.pathname.startsWith("/faucet")}
              onClick={handleNavButtonClick("faucet/dashboard")}
            />
          </li>
          {featureToggles.gardenCalculator && (
            <li>
              <Button
                className="bp3-minimal nav-item"
                icon="tree"
                text="drip garden"
                active={location.pathname.startsWith("/drip-garden")}
                onClick={handleNavButtonClick("drip-garden/dashboard")}
              />
            </li>
          )}
          {/* <li>
            <Button
              className="bp3-minimal nav-item"
              icon="tractor"
              text="animal farm"
              active={location.pathname.startsWith("/animal-farm")}
              onClick={handleNavButtonClick("animal-farm/dashboard")}
            />
          </li> */}
        </ul>
      </>
    );
  };

  const renderMobileMenu = () => {
    return (
      <div
        className={`mobile-menu ${
          isMobileMenuExpanded ? "expanded" : "collapsed"
        }`}
      >
        <ul>
          <li>
            <Button
              className="bp3-minimal nav-item"
              icon="home"
              text="dashboard"
              active={location.pathname === "/"}
              onClick={handleNavButtonClick("/")}
            />
          </li>
          <li>
            <Button
              className="bp3-minimal nav-item"
              icon="tint"
              text="drip faucet"
              active={location.pathname.startsWith("/faucet")}
              onClick={handleNavButtonClick("/faucet/dashboard")}
            />
            {location.pathname.startsWith("/faucet") && (
              <ul className="mobile-child-menu">
                <li>
                  <Button
                    className="bp3-minimal nav-item"
                    text="faucet dashboard"
                    active={location.pathname === "/faucet/dashboard"}
                    onClick={handleNavButtonClick("/faucet/dashboard")}
                  />
                </li>
                <li>
                  <Button
                    className="bp3-minimal nav-item"
                    text="faucet information"
                    active={location.pathname === "/faucet/information"}
                    onClick={handleNavButtonClick("/faucet/information")}
                  />
                </li>
              </ul>
            )}
          </li>
          {featureToggles.gardenCalculator && (
            <li>
              <Button
                className="bp3-minimal nav-item"
                icon="tree"
                text="drip garden"
                active={location.pathname.startsWith("/drip-garden")}
                onClick={handleNavButtonClick("/drip-garden/dashboard")}
              />
              {location.pathname.startsWith("/drip-garden") && (
                <ul className="mobile-child-menu">
                  <li>
                    <Button
                      className="bp3-minimal nav-item"
                      text="garden dashboard"
                      active={location.pathname === "/drip-garden/dashboard"}
                      onClick={handleNavButtonClick("/drip-garden/dashboard")}
                    />
                  </li>
                  <li>
                    <Button
                      className="bp3-minimal nav-item"
                      text="information"
                      active={location.pathname === "/drip-garden/information"}
                      onClick={handleNavButtonClick("/drip-garden/information")}
                    />
                  </li>
                </ul>
              )}
            </li>
          )}
          {/* <li>
            <Button
              className="bp3-minimal nav-item"
              icon="tractor"
              text="animal farm"
              active={location.pathname.startsWith("/animal-farm")}
              onClick={handleNavButtonClick("/animal-farm/dashboard")}
            />
            {location.pathname.startsWith("/animal-farm") && (
              <ul className="mobile-child-menu">
                <li>
                  <Button
                    className="bp3-minimal nav-item"
                    text="farm dashboard"
                    active={location.pathname === "/animal-farm/dashboard"}
                    onClick={handleNavButtonClick("/animal-farm/dashboard")}
                  />
                </li>
                <li>
                  <Button
                    className="bp3-minimal nav-item"
                    text="information"
                    active={location.pathname === "/animal-farm/information"}
                    onClick={handleNavButtonClick("/animal-farm/information")}
                  />
                </li>
              </ul>
            )}
          </li> */}
        </ul>
        {renderGitHubSection()}
      </div>
    );
  };

  const renderGitHubSection = () => {
    return (
      <div className="github-section">
        <span>This project is open source</span>
        <a
          href="https://github.com/fr3shw3b/dripcalc"
          className="github-link"
          target="_blank"
          rel="noreferrer"
        >
          <Button icon="share" text="GitHub" minimal />
        </a>
      </div>
    );
  };

  const fiatModeSwitchOnContent =
    "Turn this switch on to show estimated FIAT currency earnings in calculators and to enter deposits in FIAT";
  const fiatModeSwitchOffContent =
    "Turn this switch off to show only DRIP units (or DRIP/BUSD LP in the garden) and convert to current market price in the toolbar";
  return (
    <header className="header">
      <Navbar>
        <Navbar.Group align={isMobile ? Alignment.CENTER : Alignment.LEFT}>
          <Navbar.Heading>
            {" "}
            <a href="/">
              <img src={logo} alt="dripcalc" width={100} />
            </a>
          </Navbar.Heading>

          {isMobile && (
            <Icon
              icon={isMobileMenuExpanded ? "cross" : "menu"}
              className="menu-icon"
              onClick={handleMenuIconClick}
            />
          )}
          {!isMobile && (
            <>
              {renderDesktopMenu()}
              {renderGitHubSection()}
            </>
          )}
          {featureToggles.dripFiatModeToggle && (
            <div className="price-drip-fiat-toggle-section">
              <Tooltip2
                content={
                  fiatMode ? fiatModeSwitchOffContent : fiatModeSwitchOnContent
                }
                position={Position.BOTTOM}
                openOnTargetFocus={false}
              >
                <Switch
                  checked={fiatMode}
                  label="fiat mode"
                  alignIndicator="right"
                  onChange={() => dispatch(toggleFiatMode())}
                />
              </Tooltip2>
              <Tooltip2
                content={`The current price of DRIP in ${currency} on the native DEX`}
                position={Position.BOTTOM}
                openOnTargetFocus={false}
              >
                {nativeDexDripPriceInCurrency === 0 ? (
                  <div className="bp3-skeleton">
                    ${formatCurrency(currency, nativeDexDripPriceInCurrency)}
                  </div>
                ) : (
                  formatCurrency(currency, nativeDexDripPriceInCurrency)
                )}
              </Tooltip2>
            </div>
          )}
        </Navbar.Group>
      </Navbar>

      {isMobile && renderMobileMenu()}
      {!isFirstTime && <Toolbar />}
    </header>
  );
}

export default Header;
