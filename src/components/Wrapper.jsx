/* eslint-disable */
import React from "react";
import "./Wrapper.css";
import Scene from "./Scene";
import SceneTwo from './SceneTwo';

const Wrapper = () => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    // const scene = new Scene(ref.current);
    const scene = new SceneTwo(ref.current);

    return () => scene.destroy();
  }, [ref]);

  return <div className="root" ref={ref} />;
};

export default Wrapper;
