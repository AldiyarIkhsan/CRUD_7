declare global {
  var __JEST_STATE__: any;
}

if (typeof global !== 'undefined') {
  global.__JEST_STATE__ = global.__JEST_STATE__ || {};
}

export const setJestState = (key: string, value: any) => {
  console.log('Setting Jest state:', key, value);
  
  if (typeof global !== 'undefined') {
    global.__JEST_STATE__[key] = value;
    console.log('Global state after setting:', global.__JEST_STATE__);
  }
};

export const getJestState = (key: string) => {
  console.log('Getting Jest state for key:', key);
  
  if (typeof global !== 'undefined' && global.__JEST_STATE__) {
    const value = global.__JEST_STATE__[key];
    console.log('Found in global state:', value);
    return value;
  }

  console.log('No value found for key:', key);
  return undefined;
};

export const clearJestState = () => {
  console.log('Clearing Jest state');
  
  if (typeof global !== 'undefined') {
    global.__JEST_STATE__ = {};
  }
};
