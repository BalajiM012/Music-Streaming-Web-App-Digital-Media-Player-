import React from "react";
import { Loader as LoaderIcon } from "lucide-react";
import "./Loader.css";

const Loader = ({ size = 32, text = "Loading...", fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <LoaderIcon size={size} className="spinner" />
        {text && <p className="loader-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className="loader-inline">
      <LoaderIcon size={size} className="spinner" />
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;

