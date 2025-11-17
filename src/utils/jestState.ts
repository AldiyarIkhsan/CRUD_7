// Используем глобальный jest-expect, который предоставляет setState/getState
// Получаем expect динамически при каждом вызове, так как он может быть недоступен при загрузке модуля
const getJestExpect = () => {
  if (typeof global !== "undefined") {
    return (global as any).expect;
  }
  if (typeof window !== "undefined") {
    return (window as any).expect;
  }
  return undefined;
};

type KV = Record<string, any>;

// Сохранение значения в Jest state
export const setJestState = (keyOrObj: string | KV, value?: any) => {
  const jestExpect = getJestExpect();
  if (!jestExpect || typeof jestExpect.setState !== "function") {
    // В продакшене это нормально, просто игнорируем
    return;
  }

  try {
    if (typeof keyOrObj === "string") {
      jestExpect.setState({ [keyOrObj]: value });
    } else {
      jestExpect.setState(keyOrObj);
    }
  } catch (error) {
    // Игнорируем ошибки в продакшене
    console.error("Error setting Jest state:", error);
  }
};

// Получение значения из Jest state
export const getJestState = (key?: string) => {
  const jestExpect = getJestExpect();
  if (!jestExpect || typeof jestExpect.getState !== "function") return undefined;

  try {
    const state = jestExpect.getState() as KV;
    return key ? state[key] : state;
  } catch (error) {
    return undefined;
  }
};

// Очистка Jest state
export const clearJestState = () => {
  const jestExpect = getJestExpect();
  if (!jestExpect || typeof jestExpect.setState !== "function") return;

  try {
    jestExpect.setState({
      code: undefined,
      accessToken: undefined,
      newUserCreds: undefined,
    });
  } catch (error) {
    // Игнорируем ошибки в продакшене
    console.error("Error clearing Jest state:", error);
  }
};
