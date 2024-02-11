import React from "react";
import ReactDOM from "react-dom";
import User from "./User";

const user = window.__USER__;

ReactDOM.hydrate(<User user={user} />, document.getElementById("root"));