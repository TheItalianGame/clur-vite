import React from 'react';
import DynamicForm from './DynamicForm';

interface Props {
  record: string;
  data: Record<string, unknown>;
}

const Summary: React.FC<Props> = ({ record, data }) => (
  <div className="summary-box">
    <DynamicForm record={record} formType="main" data={data} />
  </div>
);

export default Summary;
