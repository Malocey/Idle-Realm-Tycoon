import React from 'react';
import Button from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-6xl' // Increased from 3xl to 6xl
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-[100px]">
      <div className={`bg-slate-800 rounded-xl shadow-2xl w-full ${sizeClasses[size]} glass-effect flex flex-col max-h-[calc(100vh-150px)] animate-modal-content-enter`}>
        <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-sky-400">{title}</h2>
          <Button onClick={onClose} variant="ghost" size="sm">&times;</Button>
        </div>
        <div className="p-6 fancy-scrollbar overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;