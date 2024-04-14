import React from "react";
import {Navigate, Outlet } from "react-router-dom";
import {useContext } from "react";
import { AuthContext } from "../pages/AuthContext";

function ProtectedRoutes({ element: Component, ...rest }) {
  const { authenticated } = useContext(AuthContext);
  return authenticated ? <Outlet></Outlet> : <Navigate to="/login" />
}
export default ProtectedRoutes;