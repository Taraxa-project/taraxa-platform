import { Label } from '@taraxa_project/taraxa-ui';

export const AddressLabel = ({ label }: { label: string }) => {
  return <Label gap={true} icon={<></>} variant='loading' label={label} />;
};
