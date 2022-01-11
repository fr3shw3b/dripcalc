import { Routes, Route } from "react-router-dom";

import Header from "../header";
import Dashboard from "../dashboard";
import Information from "../information";

function App() {
  return (
    <div className="app bp3-dark">
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="information" element={<Information />} />
      </Routes>
    </div>
  );
}

export default App;
