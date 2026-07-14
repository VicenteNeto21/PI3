import React from 'react';
import { Form } from 'react-bootstrap';
import './Input.css';

export const Input = ({ label, type = 'text', placeholder, value, onChange, className = '', ...props }) => {
  return (
    <div className="w-100">
      {label && (
        <label className="form-label fw-bold mb-1 d-block text-start" style={{ color: '#2A0041', fontSize: '0.9rem' }}>
          {label}
        </label>
      )}
      <Form.Control
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`custom-input ${className}`}
        {...props}
      />
    </div>
  );
};
