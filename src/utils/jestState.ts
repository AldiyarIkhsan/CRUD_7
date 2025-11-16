// Используем глобальный jest-expect, который предоставляет setState/getState
const jestExpect = (global as any).expect;

type KV = Record<string, any>;

// Сохранение значения в Jest state
export const setJestState = (keyOrObj: string | KV, value?: any) => {
  if (!jestExpect || typeof jestExpect.setState !== "function") return;

  if (typeof keyOrObj === "string") {
    jestExpect.setState({ [keyOrObj]: value });
  } else {
    jestExpect.setState(keyOrObj);
  }
};

// Получение значения из Jest state
export const getJestState = (key?: string) => {
  if (!jestExpect || typeof jestExpect.getState !== "function") return undefined;

  const state = jestExpect.getState() as KV;
  return key ? state[key] : state;
};

// Очистка Jest state
export const clearJestState = () => {
  if (!jestExpect || typeof jestExpect.setState !== "function") return;

  jestExpect.setState({
    code: undefined,
    accessToken: undefined,
    newUserCreds: undefined,
  });
};
