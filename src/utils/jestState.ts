// utils/jestState.ts

// Helper function to set Jest state
export const setJestState = (key: string, value: any) => {
  try {
    // @ts-ignore
    if (typeof expect !== 'undefined' && expect.setState) {
      // @ts-ignore
      expect.setState({ [key]: value });
    }
  } catch (e) {
    // Ignore errors if expect is not available
  }
};

// Helper function to get Jest state
export const getJestState = (key: string) => {
  try {
    // @ts-ignore
    if (typeof expect !== 'undefined' && expect.getState) {
      // @ts-ignore
      return expect.getState()[key];
    }
  } catch (e) {
    // Ignore errors if expect is not available
  }
  return undefined;
};

// Helper function to clear Jest state
export const clearJestState = () => {
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
