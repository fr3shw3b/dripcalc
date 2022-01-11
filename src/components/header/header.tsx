import { Navbar, Alignment, Button } from "@blueprintjs/core";
import type { MouseEventHandler } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavButtonClick: (path: string) => MouseEventHandler =
    (path) => (evt) => {
      evt.preventDefault();
      navigate(path);
    };

  return (
    <Navbar>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>dripcalc</Navbar.Heading>
        <Navbar.Divider />
        <Button
          className="bp3-minimal"
          icon="home"
          text="dashboard"
          active={location.pathname === "/"}
          onClick={handleNavButtonClick("/")}
        />
        <Button
          className="bp3-minimal"
          icon="info-sign"
          text="information"
          active={location.pathname === "/information"}
          onClick={handleNavButtonClick("information")}
        />
      </Navbar.Group>
    </Navbar>
  );
}

export default Header;
