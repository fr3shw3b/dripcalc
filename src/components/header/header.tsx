import { Navbar, Alignment, Button, Icon } from "@blueprintjs/core";
import { MouseEventHandler, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Toolbar from "../toolbar";
import useMobileCheck from "../../hooks/use-mobile-check";

import logo from "../../logo.svg";

import "./header.css";
import { AppState } from "../../store/types";

function Header() {
  const isFirstTime = useSelector(
    (state: AppState) => state.general.isFirstTime
  );
  const [isMobileMenuExpanded, setMobileMenuExpanded] = useState(false);
  const isMobile = useMobileCheck();
  const navigate = useNavigate();
  const location = useLocation();

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
          {/* <li>
            <Button
              className="bp3-minimal nav-item"
              icon="tree"
              text="drip garden"
              active={location.pathname.startsWith("/drip-garden")}
              onClick={handleNavButtonClick("drip-garden/dashboard")}
            />
          </li> */}
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
          {/* <li>
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
          </li> */}
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
        </Navbar.Group>
      </Navbar>
      {isMobile && renderMobileMenu()}
      {!isFirstTime && <Toolbar />}
    </header>
  );
}

export default Header;
