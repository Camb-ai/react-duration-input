import React from 'react';
import { useDurationInput } from '../lib/hooks';
import './react-duration-input.css';

export interface IInputDuration extends Omit<React.HTMLProps<HTMLInputElement>, 'onTimeUpdate' | 'onChange'> {
  timeInMilliseconds: number;
  showMilliseconds?: boolean;
  allowInPlaceDeletion?: boolean;
  separator?: string;
  allowOverflow?: boolean;
  max?: number;
  editable?: boolean;
  disabled?: boolean;
  className?: string;
  onTimeUpdate?: (timeInMilliseconds: number) => void;
  onManualInputUpdate?: (props: {
    inputText: string;
    timeInMilliseconds: number | null;
    isCorrectFormat: boolean;
  }) => void;
}

const InputDuration = (props: IInputDuration) => {
  const inputProps = useDurationInput(props);

  return <input {...inputProps} />;
};

export default InputDuration;
