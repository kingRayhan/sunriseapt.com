import DashboardScaffold from "@/components/dashboard/dashboard-scaffold";
import React from "react";

const DashboardLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <DashboardScaffold>{children}</DashboardScaffold>;
};

export default DashboardLayout;
