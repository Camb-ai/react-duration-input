import * as React from 'react';
import { useDurationInput } from '../src';
import '../src/react-duration-input/react-duration-input.css';
import './App.css';

function App() {
  const inputProps = useDurationInput();

  return (
    <div className='App'>
      <div className='container'>
        <div>
          <input {...inputProps} />
        </div>
      </div>
    </div>
  );
}

export default App;
