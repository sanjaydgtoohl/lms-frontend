import React from 'react';
import PageBackHeader from './PageBackHeader';

interface MasterFormHeaderProps {
  onBack: () => void;
  title: string;
}

const MasterFormHeader: React.FC<MasterFormHeaderProps> = ({ onBack, title }) => (
  <PageBackHeader onBack={onBack} title={title} />
);

export default MasterFormHeader;