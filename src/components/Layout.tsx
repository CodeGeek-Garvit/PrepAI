import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.tsx';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
