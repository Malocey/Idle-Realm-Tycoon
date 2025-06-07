
import React from 'react';
import Modal, { ModalProps } from './Modal';
import Button from './Button';
import { ICONS } from './Icons'; // For potential icon usage

interface PoiInteractionModalProps extends Omit<ModalProps, 'children'> {
  nodeName: string;
  children: React.ReactNode;
  onConfirm?: () => void; // Optional callback for a confirm action
  confirmButtonText?: string; // Optional text for the confirm button
  isConfirmDisabled?: boolean; // Optional to disable confirm button
}

const PoiInteractionModal: React.FC<PoiInteractionModalProps> = ({
  isOpen,
  onClose,
  title,
  nodeName,
  children,
  size = 'md',
  onConfirm,
  confirmButtonText,
  isConfirmDisabled = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <div className="space-y-4">
        <p className="text-lg text-slate-300">
          You are at <span className="font-semibold text-amber-300">{nodeName}</span>.
        </p>
        <div className="text-slate-400">{children}</div>
        <div className={`flex ${onConfirm ? 'justify-between' : 'justify-end'} items-center mt-6 pt-4 border-t border-slate-700/50`}>
          <Button onClick={onClose} variant="secondary" className={onConfirm ? '' : 'w-full'}>
            Close
          </Button>
          {onConfirm && confirmButtonText && (
            <Button onClick={onConfirm} variant="primary" disabled={isConfirmDisabled}>
              {confirmButtonText}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PoiInteractionModal;