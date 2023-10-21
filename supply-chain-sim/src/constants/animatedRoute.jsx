import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { landingRoute, digitalTwinRoute } from "./route";
import LandingPage from "../pages/LandingPage";
import DigitalTwinPage from "../pages/DigitalTwinPage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes key={location.pathname} location={location}>
        <Route path={digitalTwinRoute} element={<DigitalTwinPage />} />
        <Route path={landingRoute} element={<LandingPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
