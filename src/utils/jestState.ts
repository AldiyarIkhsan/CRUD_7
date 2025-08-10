
declare const expect: any;

type KV = Record<string, any>;

export const setJestState = (keyOrObj: string | KV, value?: any) => {
  if (typeof expect?.setState !== "function") return;
  if (typeof keyOrObj === "string") {
    expect.setState({ [keyOrObj]: value });
  } else {
    expect.setState(keyOrObj);
  }
};

export const getJestState = (key?: string) => {
  if (typeof expect?.getState !== "function") return undefined;
  const state = expect.getState() as KV;
  return key ? state?.[key] : state;
};

export const clearJestState = () => {
  if (typeof expect?.setState !== "function") return;
  expect.setState({
    code: undefined,
    accessToken: undefined,
    newUserCreds: undefined,
  });
};
