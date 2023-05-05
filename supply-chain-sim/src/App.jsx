import { useState } from "react";
import "./App.css";
import Navigation from "./components/navbar";
import AnimatedRoutes from "./constants/animatedRoute";

function App() {
  return (
    <div>
      <Navigation />
      <AnimatedRoutes />
    </div>
  );
}

export default App;
