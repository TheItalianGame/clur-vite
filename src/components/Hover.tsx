import React from 'react';
import DynamicForm from './DynamicForm';

interface Props {
  record: string;
  data: Record<string, unknown>;
}

const Hover: React.FC<Props> = ({ record, data }) => (
  <div className="hover-box">
    <DynamicForm record={record} formType="hover" data={data} />
  </div>
);

export default Hover;
