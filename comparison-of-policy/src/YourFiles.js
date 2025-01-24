import React from 'react';
import { useNavigate } from 'react-router-dom';
import './stylesheets/YourFiles.css';

const YourFiles = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/compare-files'); 
  };

  return (
    <div>
    <navbar/> 
    <div className = "your-files-page">
        <div className = "files-header">
            <h1>
                Your Files
            </h1>
        </div>
        <div className = "policies">
            <div className="square" onClick={handleClick}>
                <div className="plus">+</div>
        </div>
        </div>
    </div>
    </div>
  );
};

export default YourFiles;