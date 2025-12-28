import React from 'react';
import './Toggle.css';

const Toggle = ({ label, checked, onChange }) => {
    return (
        <div
            className={`toggle-container ${checked ? 'active' : ''}`}
            onClick={() => onChange(!checked)}
        >
            <div className="toggle-switch">
                <div className="toggle-slider" />
            </div>
            {label && <span className="toggle-label">{label}</span>}
        </div>
    );
};

export default Toggle;
