import React from 'react';

const LayoutContainer = ({ children }) => {
  return (
    <div className="flex h-full grow flex-col">
      {children}
    </div>
  );
};

export default LayoutContainer;