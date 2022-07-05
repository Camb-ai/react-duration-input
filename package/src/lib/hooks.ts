import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import {
  formatAsYouType,
  isCorrectTimeFormat,
  transformTimeNumToString,
  transformTimeStringToNum,
  zeroTimeInSeconds,
  getAmountFromCursorPos,
} from './duration';

type DurationInputProps = {
  timeInMilliseconds?: number;
  isMilliseconds?: boolean;
  allowInPlaceDeletion?: boolean;
  separator?: string;
  allowOverflow?: boolean; // allow the user to overflow a time slot, the logic will recalculate this format it correctly to the next time  slot (i.e 90 miuntes -> 1 hour 30 minutes)
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
  debugMode?: boolean;
};

export const useDurationInput = (props?: DurationInputProps) => {
  const {
    timeInMilliseconds = 0,
    isMilliseconds = true,
    allowInPlaceDeletion = true,
    separator = ':',
    allowOverflow = false,
    max = Number.POSITIVE_INFINITY,
    editable = true,
    disabled,
    className = '',
    onTimeUpdate,
    onManualInputUpdate,
    debugMode,
    ...rest
  } = props ?? {};

  const [currentTime, setCurrentTime] = useState(timeInMilliseconds);
  const [inputText, setInputText] = useState(transformTimeNumToString(timeInMilliseconds, isMilliseconds));

  // Manual flag to kick of useLayoutEffect on inputtext update
  const [flag, setFlag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorStart = useRef<number>(0);
  const cursorEnd = useRef<number>(0);

  /**
   * Ensures cursor/selection position is maintained throughout text value rerender updates
   */

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.selectionStart = cursorStart.current;
      inputRef.current.selectionEnd = cursorEnd.current;
    }

    return () => {
      if (inputRef.current) {
        inputRef.current.selectionStart = cursorStart.current;
        inputRef.current.selectionEnd = cursorEnd.current;
      }
    };
  }, [currentTime, setCurrentTime, inputText, setInputText, timeInMilliseconds, flag]);

  /**
   * Syncs time with parent prop. making this a controlled component
   */
  useEffect(() => {
    if (timeInMilliseconds !== currentTime || timeInMilliseconds > max) {
      setCurrentTime(Math.min(timeInMilliseconds, max));
    }
    setFlag((prev) => !prev);
  }, [timeInMilliseconds]);

  // Syncs current time with shown text value
  useEffect(() => {
    setInputText(transformTimeNumToString(currentTime, isMilliseconds));
  }, [currentTime, timeInMilliseconds]);

  /**
   * Syncs parent onTimeUpdate handlers with local state
   */
  useEffect(() => {
    onTimeUpdate && onTimeUpdate?.(currentTime);
  }, [currentTime]);

  /**
   *  Syncs parent onManualInputUpdate handler with local text state
   */
  useEffect(() => {
    onManualInputUpdate?.({
      inputText,
      timeInMilliseconds: isCorrectTimeFormat(inputText, isMilliseconds)
        ? transformTimeStringToNum(inputText, isMilliseconds, allowOverflow)
        : null,
      isCorrectFormat: isCorrectTimeFormat(inputText, isMilliseconds),
    });
  }, [inputText]);

  const placeHolder = isMilliseconds ? zeroTimeInSeconds.join(separator) + '.000' : zeroTimeInSeconds.join(separator);

  /**
   * Handlers
   */

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const timeString = event.target.value;

    const target = event.target as any;

    if (typeof target.selectionStart === 'number') cursorStart.current = target.selectionStart;
    if (typeof target.selectionEnd === 'number') cursorEnd.current = target.selectionEnd;

    if (debugMode) {
      console.log('HandleValueChange START');
      console.log('handleValueChange', {
        timeString,
      });
    }

    if (editable) {
      if (isCorrectTimeFormat(timeString, isMilliseconds)) {
        const newTime = Math.min(transformTimeStringToNum(timeString, isMilliseconds, allowOverflow), max);
        if (debugMode) {
          console.log('timeString is correct format', {
            timeString,
            newTime,
          });
        }

        if (newTime !== currentTime) {
          setCurrentTime(newTime);
        } else {
          setInputText(transformTimeNumToString(newTime, isMilliseconds));
        }
      } else {
        // If initial input is incorrect format apply checks and allow user to update local statetext but not actualy time state
        const { newTimeString, newCursorPosition } = formatAsYouType({
          timeString,
          separator,
          isMilliseconds: isMilliseconds,
          cursorPosition: cursorStart.current,
          allowInPlaceDeletion,
        });

        if (debugMode) {
          console.log('timeString is incorrect format, this is new TimeString', {
            newTimeString,
          });
        }

        cursorStart.current = newCursorPosition;
        cursorEnd.current = newCursorPosition;

        // User input data post format passes check to update state
        if (isCorrectTimeFormat(newTimeString, isMilliseconds)) {
          const newTime = Math.min(transformTimeStringToNum(newTimeString, isMilliseconds, allowOverflow), max);

          if (debugMode) {
            console.log('newTimeString is correct format', {
              newTimeString,
              newTime,
            });
          }

          if (newTime !== currentTime) {
            setCurrentTime(newTime);
          } else {
            setInputText(newTimeString);
          }
        } else {
          setInputText(newTimeString);
        }
      }
    }

    setFlag((prev) => !prev);
  };

  const HandlerKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const target = event.target as any;

    if (typeof target.selectionStart === 'number') cursorStart.current = target.selectionStart;
    if (typeof target.selectionEnd === 'number') cursorEnd.current = target.selectionEnd;

    if (editable) {
      const interval = getAmountFromCursorPos(cursorStart.current);
      switch (event?.key) {
        case 'ArrowDown':
          event.preventDefault();
          setCurrentTime((prev) => Math.max(prev - interval, 0));

          break;
        case 'ArrowUp':
          event.preventDefault();
          setCurrentTime((prev) => Math.min(prev + interval, max));

          break;

        default:
      }
    }

    setFlag((prev) => !prev);
  };

  const pattern = isMilliseconds
    ? `^[0-9]{2}${separator}[0-9]{2}${separator}[0-9]{2}.[0-9]{3}$`
    : `^[0-9]{2}${separator}[0-9]{2}${separator}[0-9]{2}$`;

  return {
    ref: inputRef,
    'data-format': `${isMilliseconds ? 'milliseconds' : 'seconds'}`,
    className: `react-duration-input ${className}`,
    type: 'text',
    disabled,
    placeholder: placeHolder,
    value: inputText,
    onChange: handleValueChange,
    onKeyDown: HandlerKeyDown,
    pattern,
    'data-testid': 'timeFormatter',
  };
};
