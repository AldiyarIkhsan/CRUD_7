// ✅ Безопасная заглушка для Node.js окружения
// Jest автоматически определяет глобальный expect,
// но при запуске через ts-node / node его нет — поэтому делаем fallback.
const expect: any = (global as any).expect ?? {};

type KV = Record<string, any>;

/**
 * Сохраняет временное значение в Jest state (используется в автотестах).
 * В обычном окружении (Node) просто ничего не делает.
 */
export const setJestState = (keyOrObj: string | KV, value?: any) => {
  if (typeof expect?.setState !== "function") return;
  if (typeof keyOrObj === "string") {
    expect.setState({ [keyOrObj]: value });
  } else {
    expect.setState(keyOrObj);
  }
};

/**
 * Получает значение из Jest state.
 * В Node без Jest возвращает undefined.
 */
export const getJestState = (key?: string) => {
  if (typeof expect?.getState !== "function") return undefined;
  const state = expect.getState() as KV;
  return key ? state?.[key] : state;
};

/**
 * Очищает все временные значения Jest state.
 * Без Jest — просто ничего не делает.
 */
export const clearJestState = () => {
  if (typeof expect?.setState !== "function") return;
  expect.setState({
    code: undefined,
    accessToken: undefined,
    newUserCreds: undefined,
  });
};
