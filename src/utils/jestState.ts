// utils/jestState.ts

// Global Jest state for tests
declare global {
  var __JEST_STATE__: any;
}

// Initialize global state
if (typeof global !== 'undefined') {
  global.__JEST_STATE__ = global.__JEST_STATE__ || {};
}

// Helper function to set Jest state
export const setJestState = (key: string, value: any) => {
  console.log('Setting Jest state:', key, value);
  
  // Set in global state
  if (typeof global !== 'undefined') {
    global.__JEST_STATE__[key] = value;
    console.log('Global state after setting:', global.__JEST_STATE__);
  }
  
  // Also try to set in expect state if available
  try {
    // @ts-ignore
    if (typeof expect !== 'undefined' && expect.setState) {
      // @ts-ignore
      expect.setState({ [key]: value });
      console.log('Expect state set successfully');
    }
  } catch (e) {
    console.log('Error setting expect state:', e);
  }
};

// Helper function to get Jest state
export const getJestState = (key: string) => {
  console.log('Getting Jest state for key:', key);
  
  // Try global state first
  if (typeof global !== 'undefined' && global.__JEST_STATE__) {
    const value = global.__JEST_STATE__[key];
    console.log('Found in global state:', value);
    return value;
  }
  
  // Try expect state if available
  try {
    // @ts-ignore
    if (typeof expect !== 'undefined' && expect.getState) {
      // @ts-ignore
      const value = expect.getState()[key];
      console.log('Found in expect state:', value);
      return value;
    }
  } catch (e) {
    console.log('Error getting expect state:', e);
  }
  
  console.log('No value found for key:', key);
  return undefined;
};

// Helper function to clear Jest state
export const clearJestState = () => {
  console.log('Clearing Jest state');
  
  if (typeof global !== 'undefined') {
    global.__JEST_STATE__ = {};
  }
  
  try {
    // @ts-ignore
    if (typeof expect !== 'undefined' && expect.setState) {
      // @ts-ignore
      expect.setState({});
    }
  } catch (e) {
    // Ignore errors if expect is not available
  }
};
