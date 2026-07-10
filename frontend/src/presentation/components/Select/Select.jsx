import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './Select.css';

export const Select = ({ label, value, onChange, options, placeholder, className = '', ...props }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    onChange({ target: { value: opt.value } });
    setOpen(false);
  };

  return (
    <div className="w-100" ref={containerRef}>
      {label && (
        <label className="form-label fw-bold mb-1 d-block text-start" style={{ color: '#2A0041', fontSize: '0.9rem' }}>
          {label}
        </label>
      )}
      <div
        className={`custom-select-wrapper ${className}`}
        onClick={() => setOpen(!open)}
        {...props}
      >
        <div className={`custom-select-trigger ${open ? 'custom-select-open' : ''}`}>
          <span className={selected ? 'custom-select-value' : 'custom-select-placeholder'}>
            {selected ? selected.label : placeholder || 'Selecione...'}
          </span>
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`custom-select-arrow ${open ? 'custom-select-arrow-up' : ''}`}
          />
        </div>
        {open && (
          <div className="custom-select-dropdown">
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`custom-select-option ${opt.value === value ? 'custom-select-option-selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleSelect(opt); }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
