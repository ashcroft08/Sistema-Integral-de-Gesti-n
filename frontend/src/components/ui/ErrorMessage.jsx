// src/components/UI/ErrorMessage.jsx
import React from "react";

const ErrorMessage = ({ message, onClose }) => {
  return (
    <div className="rounded-lg bg-status-offline/10 border border-status-offline/30 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-status-offline">
            error
          </span>
          <div>
            <h4 className="font-semibold text-status-offline">Error</h4>
            <p className="text-sm text-text-secondary dark:text-background-light/80">
              {message}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-status-offline hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
