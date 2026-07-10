import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';
import './Button.css';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  return (
    <BootstrapButton 
      variant={variant} 
      className={`custom-button ${className}`}
      {...props}
    >
      {children}
    </BootstrapButton>
  );
};
