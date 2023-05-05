import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import SimulationPage from "./pages/SimulationPage";
import AnalyticPage from "./pages/AnalyticPage";
import {
  simulationRoute,
  bpmnRoute,
  landingRoute,
  analysisRoute,
} from "./constants/route";

function App() {
  return (
    <Routes>
      <Route path={landingRoute} element={<LandingPage />} />
      <Route path={simulationRoute} element={<SimulationPage />} />
      <Route path={analysisRoute} element={<AnalyticPage />} />
    </Routes>
  );
}

export default App;
