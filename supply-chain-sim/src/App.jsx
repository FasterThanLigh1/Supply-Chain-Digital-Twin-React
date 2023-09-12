import { useEffect, useState } from "react";
import "./App.css";
import Navigation from "./components/navbar";
import AnimatedRoutes from "./constants/animatedRoute";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "./features/userSlice";

function App() {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    console.log("Current user: ", currentUser);
    let data = sessionStorage.getItem("currentUser");
    console.log("Session user: ", data);
    setSessionUser(data);
  }, []);

  return (
    <div>
      {currentUser !== null ? <Navigation /> : null}
      <AnimatedRoutes />
    </div>
  );
}

export default App;
