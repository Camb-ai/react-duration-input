export const zeroTimeInSeconds = ['00', '00', '00'];
export const zeroTimeInMilliSeconds = [...zeroTimeInSeconds, '000'];

export const isCorrectTimeFormat = (timeString: string, isMilliseconds: boolean) => {
  if (typeof timeString !== 'string') return false;

  const regExp = isMilliseconds ? /^[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}$/ : /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/;

  return regExp.test(timeString);
};

export const transformTimeStringToNum = (
  timeString: string,
  isMilliseconds = true,
  overflow = false,
  separator = ':'
) => {
  if (!isCorrectTimeFormat(timeString, isMilliseconds)) return 0;

  const regExp = new RegExp(`${separator}|\\.`, 'gi');

  const numbers = timeString
    .split(regExp)
    .map((num) => parseInt(num))
    .reverse();

  const multiplier = isMilliseconds ? [1, 1000, 1000 * 60, 1000 * 60 * 60] : [1000, 1000 * 60, 1000 * 60 * 60];
  const slotMaxs = isMilliseconds
    ? [1000, 1000 * 60, 1000 * 60 * 60, 1000 * 60 * 60 * 24]
    : [1000 * 60, 1000 * 60 * 60, 1000 * 60 * 60 * 24];

  const time = numbers.reduce((accu, curr, index) => {
    accu += overflow ? curr * multiplier[index] : Math.min(curr * multiplier[index], slotMaxs[index]);

    return accu;
  }, 0);

  return time;
};

export const transformTimeNumToString = (timeInMilliseconds: number, showMilliseconds = true, separator = ':') => {
  if (typeof timeInMilliseconds !== 'number')
    return showMilliseconds ? zeroTimeInMilliSeconds.join(separator) : zeroTimeInSeconds.join(separator);

  let amountInMilliseconds = timeInMilliseconds;

  const hours = Math.floor(amountInMilliseconds / (1000 * 60 * 60));
  amountInMilliseconds = Math.floor(amountInMilliseconds % (1000 * 60 * 60));

  const minutes = Math.floor(amountInMilliseconds / (1000 * 60));
  amountInMilliseconds = Math.floor(amountInMilliseconds % (1000 * 60));

  const seconds = Math.floor(amountInMilliseconds / 1000);
  amountInMilliseconds = Math.floor(amountInMilliseconds % 1000);

  const newTime = [zeroPad(hours, 2), zeroPad(minutes, 2), zeroPad(seconds, 2)];
  let newTimeString = newTime.join(separator);
  if (showMilliseconds) {
    newTimeString += '.' + zeroPad(amountInMilliseconds, 3);
  }

  return newTimeString;
};

export const timeStringHasAllowedChars = ({
  timeString,
  isMilliseconds = true,
  separator = ':',
}: {
  timeString: string;
  isMilliseconds: boolean;
  separator: string;
}) => {
  const regExp = new RegExp(`[^0-9${separator}${isMilliseconds ? '\\.' : ''}]`, 'g');
  return !regExp.test(timeString);
};

/**
 * take a timeString of numbers, colons/seaprators/dots. along with a cursor position and product a
 * formatted timeString with updated cursor position.
 */

export const formatAsYouType: (props: {
  timeString: string;
  separator: string;
  isMilliseconds: boolean;
  cursorPosition: number;
  allowInPlaceDeletion?: boolean;
}) => { newTimeString: string; newCursorPosition: number } = ({
  timeString,
  separator = ':',
  isMilliseconds,
  cursorPosition,
  allowInPlaceDeletion = true,
}) => {
  const letters = timeString.split('');

  // Zero length timestring use case
  if (letters.length === 0) return { newTimeString: '', newCursorPosition: cursorPosition };

  /**
   * Remove All non numbers/separators
   */

  if (!timeStringHasAllowedChars({ timeString, isMilliseconds, separator })) {
    const orignalLength = letters.length;

    for (let i = orignalLength - 1; i >= 0; i--) {
      if (!isAllowedKey({ letter: letters[i], separator })) {
        letters.splice(i, 1);
        if (cursorPosition > i) {
          cursorPosition = Math.max(cursorPosition - 1, 0);
        }
      }
    }
  }

  const allowedLength = isMilliseconds ? 12 : 8;

  /**
   * Sets in place deletion when the timestring is fully typed out
   * (more than 12 letters) and more edits are being made
   */
  if (allowInPlaceDeletion && ((isMilliseconds && letters.length > 12) || (!isMilliseconds && letters.length > 8))) {
    const regExp = new RegExp(`${separator}|\\.`, 'gi');
    const slots = timeString.split(regExp);

    if (slots.length >= 1 && slots[0].length > 2) {
      if (cursorPosition <= 2) letters.splice(cursorPosition, 1);

      if (cursorPosition === 3) {
        const newChar = letters.splice(cursorPosition - 1, 1)[0];
        letters.splice(cursorPosition, 1, newChar)[0];
        cursorPosition++;
      }
    }

    if (slots.length >= 2 && slots[1].length > 2) {
      if (cursorPosition <= 5) letters.splice(cursorPosition, 1);

      if (cursorPosition === 6) {
        const newChar = letters.splice(cursorPosition - 1, 1)[0];
        letters.splice(cursorPosition, 1, newChar)[0];
        cursorPosition++;
      }
    }

    if (slots.length >= 3 && slots[2].length > 2) {
      if (cursorPosition <= 8) letters.splice(cursorPosition, 1);

      if (cursorPosition === 9) {
        const newChar = letters.splice(cursorPosition - 1, 1)[0];
        letters.splice(cursorPosition, 1, newChar)[0];
        cursorPosition++;
      }
    }

    if (slots.length >= 4 && slots[3].length > 3) {
      if (cursorPosition > 9) letters.splice(cursorPosition, 1);
    }

    return {
      newTimeString: letters.slice(0, allowedLength).join(''),
      newCursorPosition: cursorPosition,
    };
  }

  /**
   * Logic that takes into account all comibnations of numers and separators, and formats
   * the time string as the user is typing (when timestring is less than  or equal to 12 letters)
   */

  const separatorIndeces: number[] = letters.reduce((accu, curr, index) => {
    if (curr === separator) {
      accu.push(index);
    }

    return accu;
  }, [] as number[]);

  const dotIndeces = letters.reduce((accu, curr, index) => {
    if (curr === '.') {
      accu.push(index);
    }

    return accu;
  }, [] as number[]);

  const orignalLength = letters.length;

  if (separatorIndeces.length === 0 && dotIndeces.length === 0) {
    if (orignalLength >= 3) {
      letters.splice(2, 0, separator);

      if (cursorPosition > 2) {
        cursorPosition += 1;
      }
    }

    if (orignalLength >= 5) {
      letters.splice(5, 0, separator);

      if (cursorPosition > 5) {
        cursorPosition += 1;
      }
    }

    if (orignalLength >= 7) {
      letters.splice(8, 0, '.');

      if (cursorPosition > 8) {
        cursorPosition += 1;
      }
    }
  } else if (dotIndeces.length === 0) {
    // Arbitrary length of string but will, always have only numbers and colons/separators
    if (separatorIndeces.length === 1) {
      switch (orignalLength) {
        case 1:
        case 2:
          letters.splice(separatorIndeces[0], 1);

          if (cursorPosition > separatorIndeces[0]) {
            cursorPosition -= 1;
          }

          break;

        default:
          if (separatorIndeces[0] !== 2) {
            // move the sole separator to its correct position
            const currentSeparator = letters.splice(separatorIndeces[0], 1)[0];
            letters.splice(2, 0, currentSeparator);

            if (cursorPosition > 2 && cursorPosition < separatorIndeces[0]) {
              cursorPosition += 1;
            }
          }

          if (orignalLength >= 6) {
            // String is long enough where a second colom for seconds needs to be added
            letters.splice(5, 0, separator);

            if (cursorPosition > 5) {
              cursorPosition += 1;
            }
          }

          if (orignalLength >= 8) {
            // String is long enough where a seoparator dot for milliseconds needs to be added
            letters.splice(8, 0, '.');

            if (cursorPosition > 8) {
              cursorPosition += 1;
            }
          }

          break;
      }
    } else if (separatorIndeces.length === 2) {
      // Arbitary number length string with 2 sparators

      switch (orignalLength) {
        case 1:
        case 2:
        case 3:
        case 4:
          // remove all separators;
          for (let i = separatorIndeces.length - 1; i >= 0; i--) {
            letters.splice(separatorIndeces[i], 1)[0];

            if (cursorPosition > separatorIndeces[i]) {
              cursorPosition = Math.max(cursorPosition - 1, 0);
            }
          }

          break;

        case 5:
        case 6:
          // only one 1 separator is needed remove last one
          letters.splice(separatorIndeces[1], 1);

          if (cursorPosition > separatorIndeces[1]) {
            cursorPosition -= 1;
          }

          // move the sole separator to its correct position
          if (separatorIndeces[0] !== 2) {
            const currentSeparator = letters.splice(separatorIndeces[0], 1)[0];
            letters.splice(2, 0, currentSeparator);

            if (cursorPosition > 2 && cursorPosition < separatorIndeces[0]) {
              cursorPosition += 1;
            }
          }

          break;

        default:
          // Both separators are needed move them both to the correct position starting from right to left

          if (separatorIndeces[1] !== 5) {
            const currentSeparator = letters.splice(separatorIndeces[1], 1)[0];
            letters.splice(5, 0, currentSeparator);

            if (cursorPosition > 5 && cursorPosition < separatorIndeces[1]) {
              cursorPosition += 1;
            }
          }

          if (separatorIndeces[0] !== 2) {
            const currentSeparator = letters.splice(separatorIndeces[0], 1)[0];
            letters.splice(2, 0, currentSeparator);

            if (cursorPosition > 2 && cursorPosition < separatorIndeces[0]) {
              cursorPosition += 1;
            }
          }

          if (orignalLength >= 9) {
            // String is long enough where a seoparator dot for milliseconds needs to be added
            letters.splice(8, 0, '.');

            if (cursorPosition > 8) {
              cursorPosition += 1;
            }
          }

          break;
      }
      // sdfdfs
    } else {
      /**
       * 3 or more separators, it should never get here
       * but better safe than sorry.
       */

      // remove all except the first 2 separators and recursively pass the new output to the func

      for (let i = separatorIndeces.length - 1; i >= 0; i--) {
        if (i >= 2) {
          letters.splice(separatorIndeces[i], 1)[0];

          if (cursorPosition > separatorIndeces[i]) {
            cursorPosition = Math.max(cursorPosition - 1, 0);
          }
        }
      }

      return formatAsYouType({
        timeString: letters.join(''),
        separator,
        isMilliseconds,
        cursorPosition,
        allowInPlaceDeletion,
      });
    }
  } else if (separatorIndeces.length === 0) {
    // Arbitrary length strings with numbers and dots

    // remove all dots while ensuring cursor position is adequately maintained/moved

    for (let i = dotIndeces.length - 1; i >= 0; i--) {
      letters.splice(dotIndeces[i], 1)[0];

      if (cursorPosition > dotIndeces[i]) {
        cursorPosition = Math.max(cursorPosition - 1, 0);
      }
    }

    // use recursion on new string since it is basically an all numbers string  with logic already biult earlier in the func.
    return formatAsYouType({
      timeString: letters.join(''),
      separator,
      isMilliseconds,
      cursorPosition,
      allowInPlaceDeletion,
    });
  } else {
    // mix of seprators and dots

    // remove all dots while ensuring cursor position is adequately maintained.moved

    for (let i = dotIndeces.length - 1; i >= 0; i--) {
      letters.splice(dotIndeces[i], 1)[0];

      if (cursorPosition > dotIndeces[i]) {
        cursorPosition = Math.max(cursorPosition - 1, 0);
      }
    }

    // use recursion on new string since it is basically an all numbers string  with logic already biult earlier in the func.
    return formatAsYouType({
      timeString: letters.join(''),
      separator,
      isMilliseconds,
      cursorPosition,
      allowInPlaceDeletion,
    });
  }

  return {
    newTimeString: letters.slice(0, allowedLength).join(''),
    newCursorPosition: cursorPosition,
  };
};

export const isAllowedKey = ({ letter, separator = ':' }: { letter: string; separator: string }) => {
  if (
    letter === '0' ||
    letter === '1' ||
    letter === '2' ||
    letter === '3' ||
    letter === '4' ||
    letter === '5' ||
    letter === '6' ||
    letter === '7' ||
    letter === '8' ||
    letter === '9' ||
    letter === separator ||
    letter === '.'
  ) {
    return true;
  }

  return false;
};

export const getAmountFromCursorPos = (pos: number) => {
  const OneSecond = 1000;
  const OneMinute = 1000 * 60;
  const oneHour = 1000 * 60 * 60;

  if (pos <= 2) {
    return oneHour;
  } else if (pos >= 3 && pos <= 5) {
    return OneMinute;
  } else if (pos >= 6 && pos <= 8) {
    return OneSecond;
  } else {
    return 1;
  }
};

export const zeroPad = (num: number, places: number) => {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join('0') + num;
};
