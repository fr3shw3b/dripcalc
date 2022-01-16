import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { FocusStyleManager } from "@blueprintjs/core";

import "./index.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";
import "@blueprintjs/table/lib/css/table-modern.css";

import App from "./components/app";
import reportWebVitals from "./reportWebVitals";
import configureStore from "./store/configure";
import ContentContext, { content } from "./contexts/content";
import ConfigContext, { config } from "./contexts/config";

FocusStyleManager.onlyShowFocusOnTabs();

// In the future we might want to load in preloaded state
// from a server context if we want to apply server-side
// rendering.
configureStore().then((store) => {
  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <Provider store={store}>
          <ContentContext.Provider value={content()}>
            <ConfigContext.Provider value={config()}>
              <App />
            </ConfigContext.Provider>
          </ContentContext.Provider>
        </Provider>
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
