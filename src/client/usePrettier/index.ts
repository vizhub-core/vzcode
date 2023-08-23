import { VZCodeContent } from '../../types';

export const usePrettier = ({
  submitOperation,
}: {
  submitOperation: (
    updateFunction: (document: VZCodeContent) => VZCodeContent,
  ) => void;
}) => {
  console.log('here');
};
