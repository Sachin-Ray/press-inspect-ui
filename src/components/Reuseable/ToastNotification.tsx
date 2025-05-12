import React, { useEffect } from 'react';

interface ToastNotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 max-w-xs w-full py-3 px-6 rounded-lg shadow-md ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      } text-white`}
      role="alert"
    >
      <div className="flex items-center space-x-3">
        <div>{type === 'success' ? '✔️' : '❌'}</div>
        <div>{message}</div>
      </div>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white font-bold"
        aria-label="close"
      >
        ×
      </button>
    </div>
  );
};

export default ToastNotification;
