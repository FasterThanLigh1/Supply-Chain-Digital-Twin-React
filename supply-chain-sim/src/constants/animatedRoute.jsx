import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  simulationRoute,
  bpmnRoute,
  landingRoute,
  analysisRoute,
} from "./route";
import SimulationPage from "../pages/SimulationPage";
import BpmnPage from "../pages/BpmnPage";
import LandingPage from "../pages/LandingPage";
import AnalyticPage from "../pages/AnalyticPage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes key={location.pathname} location={location}>
        <Route path={bpmnRoute} element={<BpmnPage />} />
        <Route path={landingRoute} element={<LandingPage />} />
        <Route path={simulationRoute} element={<SimulationPage />} />
        <Route path={analysisRoute} element={<AnalyticPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
