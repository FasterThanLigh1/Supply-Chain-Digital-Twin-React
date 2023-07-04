import { useEffect, useState } from "react";
import "./App.css";
import Navigation from "./components/navbar";
import AnimatedRoutes from "./constants/animatedRoute";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "./features/userSlice";

function App() {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);

  useEffect(() => {
    console.log("Current user: ", currentUser);
  }, []);

  return (
    <div>
      {currentUser !== null ? <Navigation /> : null}
      <AnimatedRoutes />
    </div>
  );
}

export default App;
