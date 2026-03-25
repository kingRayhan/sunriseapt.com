import DashboardScaffold from "@/components/dashboard/dashboard-scaffold";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Dashboard",
  },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const DashboardLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <DashboardScaffold>{children}</DashboardScaffold>;
};

export default DashboardLayout;
