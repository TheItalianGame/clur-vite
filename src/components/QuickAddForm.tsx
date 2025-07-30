import React from 'react';
import FormRenderer from './FormRenderer';

interface Props {
  record: string;
  onSubmit: (values: Record<string, string>) => void;
}

const QuickAddForm: React.FC<Props> = ({ record, onSubmit }) => (
  <FormRenderer record={record} type="quickadd" mode="edit" onSubmit={onSubmit} />
);

export default QuickAddForm;
