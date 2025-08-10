// utils/jestState.ts
// Работает в Jest: кладём/читаем через expect.setState / expect.getState.
// Вне Jest (на прод-сервере) — тихо ничего не делаем.

declare const expect: any;

type KV = Record<string, any>;

// set: setJestState('key', value) или setJestState({ key: value, ... })
export const setJestState = (keyOrObj: string | KV, value?: any) => {
  if (typeof expect?.setState !== "function") return;
  if (typeof keyOrObj === "string") {
    expect.setState({ [keyOrObj]: value });
  } else {
    expect.setState(keyOrObj);
  }
};

// get: getJestState() -> весь стейт, getJestState('key') -> значение
export const getJestState = (key?: string) => {
  if (typeof expect?.getState !== "function") return undefined;
  const state = expect.getState() as KV;
  return key ? state?.[key] : state;
};

// очистка ключей, которые читают тесты
export const clearJestState = () => {
  if (typeof expect?.setState !== "function") return;
  expect.setState({
    code: undefined,
    accessToken: undefined,
    newUserCreds: undefined,
  });
};
