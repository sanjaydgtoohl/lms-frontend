/**
 * @file Edit.tsx
 * @description Edit pre-lead (miss campaign) record form.
 * @author Sanjay Jangid <sanjay.jangid@dgtoohl.com>
 * @date 2026-05-25
 */

import React from 'react';
import Create from './Create';

// EditMissCampaign page: uses Create in 'edit' mode
const EditMissCampaign: React.FC<any> = (props) => {
  return <Create {...props} mode="edit" />;
};

export default EditMissCampaign;
