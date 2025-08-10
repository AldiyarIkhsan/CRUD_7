declare global {
  var __JEST_STATE__: Record<string, any>;
}

export const setJestState = (key: string, value: any) => {
  if (!global.__JEST_STATE__) {
    global.__JEST_STATE__ = {};
  }
  global.__JEST_STATE__[key] = value;
};

export const getJestState = (key: string) => {
  return global.__JEST_STATE__?.[key];
};

export const clearJestState = () => {
  global.__JEST_STATE__ = {};
};
