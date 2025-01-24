import React from 'react';
import { useNavigate } from 'react-router-dom';
import './stylesheets/NavBar.css';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <ul className="navbar-menu">
        <li onClick={() => navigate('/dashboard')}>Dashboard</li>
        <li onClick={() => navigate('/your-files')}>Your Files</li>
        <li onClick={() => navigate('/compare-files')}>Compare Files</li>
        <li onClick={() => navigate('/settings')}>Settings</li>
      </ul>
    </div>
  );
};

export default Navbar;