import React from 'react';
import Modal from './Modal';
import DynamicForm from './DynamicForm';

interface Props {
  record: string;
  onSubmit: (data: Record<string, string>) => void;
  onClose: () => void;
}

const QuickAdd: React.FC<Props> = ({ record, onSubmit, onClose }) => {
  const handle = (data: Record<string, string>) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h3>Quick Add {record}</h3>
      <DynamicForm record={record} formType="quickadd" onSubmit={handle} />
    </Modal>
  );
};

export default QuickAdd;
