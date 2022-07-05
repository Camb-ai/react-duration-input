# React Duration Input

A headless react input component that auto formats duration as user types in values.

## Installation

Install via NPM:

```
npm install --save react-duration-input
```

## Usage

```jsx
import { useDurationInput } from 'react-duration-input';

function InputDurationComponent() {
  const inputProps = useDurationInput();

  return <input {...inputProps} />;
}
```

## Examples

### Basic Usage

You can use the component as a controlled component and pass in the time in milliseconds to the `timeinMilliseconds` prop.

```jsx
import { useDurationInput } from 'react-duration-input';

function InputDurationComponent() {
  const [duration, setDuration] = useState(0);

  const inputProps = useDurationInput({ timeInMilliseconds: duration });

  const addOneSecond = setDuration((prev) => prev + 1000);
  const removeOneSeconds = setDuration((prev) => prev - 1000);

  return (
    <div>
      <input {...inputProps} />
      <button onClick={addOneSecond}>+ 1 </button>
      <button onClick={removeOneSeconds}>- 1 </button>
    </div>
  );
}
```

Or you can use the component as a stand alone and capture the time in milliseconds via the `onTimeUpdate` event.

```jsx
import { useDurationInput } from 'react-duration-input';

function InputDurationComponent() {
  const [duration, setDuration] = useState(0);

  const handleTimeUpdate = (timeInMilliseconds) => setDuration(timeInMilliseconds);

  const inputProps = useDurationInput({ onTimeUpdate: handleTimeUpdate });

  return (
    <div>
      <input {...inputProps} />
    </div>
  );
}
```

# Props

| Prop                   | Accepts  | Default                                                                                      | Description                                                                                                                                                                                                                                                                                             |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `timeInMilliseconds`   | number   | 0                                                                                            | time value shown in duration input in milliseconds.                                                                                                                                                                                                                                                     |
| `showMilliseconds`     | boolean  | true                                                                                         | toggle format in input component to show milliseconds (stae inside component is alawys in milliseconds).                                                                                                                                                                                                |
| `allowInPlaceDeletion` | boolean  | true                                                                                         | when user finishes typing out duration format and then places cursor in the middle of the duration value to overide a specific place value (i.e. the minutes slot tens place value ). This prop will ensure the new typed number overrides this place value instead of shifting entire duration string. |
| `separator`            | string   | ":"                                                                                          | string value to separate hours minutes and seconds.                                                                                                                                                                                                                                                     |
| `allowOverflow`        | boolean  | false                                                                                        | allow the user to overflow a time slot, the logic will recalculate this format it correctly to the next time slot (i.e 90 minutes -> 1 hour 30 minutes)                                                                                                                                                 |
| `max`                  | number   | Number.POSITIVE_INFINITY                                                                     | sets a ceiling to any value passed or calculated in duration input component.                                                                                                                                                                                                                           |
| `editable`             | boolean  | true                                                                                         | allows user to edit the duration value in the input                                                                                                                                                                                                                                                     |
| `disabled`             | boolean  | true                                                                                         | disable the input component                                                                                                                                                                                                                                                                             |
| `className`            | string   | ""                                                                                           | class to add to input component                                                                                                                                                                                                                                                                         |
| `onTimeUpdate`         | callback | (timeInMilliseconds: number) => void                                                         | call back that runs on every correct update to input component. (Correct as in any time the user types a new duration will make a check for correct format then update internal duration value).                                                                                                        |
| `onManualInputUpdate`  | callback | ({inputText: string; timeInMilliseconds: number or null; isCorrectFormat: boolean;}) => void | call back that runs on every update to input component. Not the same as the current duration value inside the input component. (i.e. user is in the middle of deleting and re adding duration values)                                                                                                   |

# CSS

You can add the css provided for some nice default styles on success/error states. Or you can add your own via the className prop.

```jsx
import { useDurationInput } from 'react-duration-input';
import 'react-duration-input/dist/index.css';

function InputDurationComponent() {
  const [duration, setDuration] = useState(0);

  const handleTimeUpdate = (timeInMilliseconds) => setDuration(timeInMilliseconds);

  const inputProps = useDurationInput({ onTimeUpdate: handleTimeUpdate });

  return (
    <div>
      <input {...inputProps} />
    </div>
  );
}
```

# Headless UI

This component was made with the idea of "Headless UI" and inversion of control design. The logic is isolated in a react hook allowing the developer to provide the ui (i.e. input component). You are free to overide the provided input props.

For example. you can override the className prop to any value you want, add your own style prop, placeholder prop, pattern prop, etc.

Please keep in mind that the hook places a ref to the input component provided in order to capture the correct events and values.
