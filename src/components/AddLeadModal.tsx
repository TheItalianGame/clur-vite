import React from 'react';
import QuickAdd from './QuickAdd';
import type { LeadRecord } from '../types';

interface Props {
  employees: string[];
  onSubmit: (emp: string, rec: LeadRecord) => void;
  onClose: () => void;
}

const AddLeadModal: React.FC<Props> = ({ onSubmit, onClose }) => {
  const handle = (data: Record<string, string>) => {
    const rec: LeadRecord = {
      firstname: data.firstname,
      lastname: data.lastname,
      create: data.create || '',
    };
    onSubmit(data.employee, rec);
  };

  return <QuickAdd record="Lead" onSubmit={handle} onClose={onClose} />;
};

export default AddLeadModal;
