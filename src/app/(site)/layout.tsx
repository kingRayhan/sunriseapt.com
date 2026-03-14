import Navbar from "@/components/Navbar";
import React from "react";
import { Footer } from "react-day-picker";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
