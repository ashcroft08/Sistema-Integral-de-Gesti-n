import React from 'react';

const LayoutContentContainer = ({ children }) => {
  return (
    <div className="flex flex-col max-w-[480px] flex-1 px-4 sm:px-6">
      {children}
    </div>
  );
};

export default LayoutContentContainer;