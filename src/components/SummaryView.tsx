import React from 'react';
import FormRenderer from './FormRenderer';

interface Props {
  record: string;
  data: Record<string, string>;
}

const SummaryView: React.FC<Props> = ({ record, data }) => (
  <FormRenderer record={record} type="summary" mode="display" initial={data} />
);

export default SummaryView;
