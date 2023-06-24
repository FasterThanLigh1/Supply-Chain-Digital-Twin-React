import React, { useEffect, useState } from "react";
import { setState } from "../features/stateSlice";

const state = {
  xPos: "0px",
  yPos: "0px",
  showMenu: false,
};

function ContextMenu() {
  const [contextMenu, setContextMenu] = useState(state);
  useEffect(() => {
    setContextMenu(state);
    document.addEventListener("click", handleClick);
    handleContextMenu();
  }, []);

  const handleClick = (e) => {
    if (contextMenu.showMenu) {
      setContextMenu((prev) => {
        return {
          ...prev,
          showMenu: false,
        };
      });
    }
  };

  const handleContextMenu = () => {
    document.addEventListener("contextmenu", (event) => {
      console.log("contextmenu");
      event.preventDefault();
      setContextMenu((prev) => {
        return {
          ...prev,
          xPos: `${event.pageX}px`,
          yPos: `${event.pageY}px`,
          showMenu: true,
        };
      });
    });
  };

  return (
    <div>
      {contextMenu.showMenu ? (
        <ul
          className="menu"
          style={{
            top: contextMenu.yPos,
            left: contextMenu.xPos,
          }}
        >
          <li>Login</li>
          <li>Register</li>
          <li>Open Profile</li>
        </ul>
      ) : null}
    </div>
  );
}

export default ContextMenu;
