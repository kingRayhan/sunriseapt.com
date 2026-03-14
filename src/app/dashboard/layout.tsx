import DashboardScaffold from "@/components/dashboard/dashboard-scaffold";
import React from "react";

export const dynamic = "force-dynamic";

const DashboardLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <DashboardScaffold>{children}</DashboardScaffold>;
};

export default DashboardLayout;
