import React from 'react';
import './Modal.css';

interface Props {
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<Props> = ({ onClose, children }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-body" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

export default Modal;
