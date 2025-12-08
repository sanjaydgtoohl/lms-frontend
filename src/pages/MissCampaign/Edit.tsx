import React from 'react';
import Create from './Create';

// EditMissCampaign page: uses Create in 'edit' mode
const EditMissCampaign: React.FC<any> = (props) => {
  return <Create {...props} mode="edit" />;
};

export default EditMissCampaign;
