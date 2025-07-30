import React from 'react';
import FormRenderer from './FormRenderer';

interface Props {
  record: string;
  data: Record<string, string>;
}

const HoverCard: React.FC<Props> = ({ record, data }) => (
  <FormRenderer record={record} type="hover" mode="display" initial={data} />
);

export default HoverCard;
