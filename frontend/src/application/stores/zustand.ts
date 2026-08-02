import { useState, useEffect } from 'react';

export type StateCreator<T> = (
  set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
  get: () => T
) => T;

export interface StoreApi<T> {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: () => void) => () => void;
}

export type UseBoundStore<T> = {
  (): T;
  <U>(selector: (state: T) => U): U;
} & StoreApi<T>;

export function create<T>(createState: StateCreator<T>): UseBoundStore<T> {
  let state: T;
  const listeners = new Set<() => void>();

  const set = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const nextPartial = typeof partial === 'function' ? (partial as (state: T) => Partial<T>)(state) : partial;
    if (nextPartial !== null && nextPartial !== undefined) {
      state = Object.assign({}, state, nextPartial);
      listeners.forEach((listener) => listener());
    }
  };

  const get = () => state;

  state = createState(set, get);

  const useStore = (selector?: (state: T) => any) => {
    const [, forceUpdate] = useState({});
    useEffect(() => {
      const callback = () => forceUpdate({});
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    }, []);
    return selector ? selector(state) : state;
  };

  (useStore as any).getState = get;
  (useStore as any).setState = set;
  (useStore as any).subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return useStore as any;
}
