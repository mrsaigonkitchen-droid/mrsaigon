export type HistoryState<T> = {
  present: T;
  past: T[];
  future: T[];
  dirty: boolean;
  version: number;
};

export function createHistory<T>(initial: T): HistoryState<T> {
  return { present: initial, past: [], future: [], dirty: false, version: 1 };
}

export function pushChange<T>(state: HistoryState<T>, next: T): HistoryState<T> {
  return {
    present: next,
    past: [state.present, ...state.past].slice(0, 50),
    future: [],
    dirty: true,
    version: state.version + 1,
  };
}

export function undo<T>(state: HistoryState<T>): HistoryState<T> {
  if (state.past.length === 0) return state;
  const [prev, ...rest] = state.past;
  return { present: prev, past: rest, future: [state.present, ...state.future], dirty: true, version: state.version + 1 };
}

export function redo<T>(state: HistoryState<T>): HistoryState<T> {
  if (state.future.length === 0) return state;
  const [next, ...rest] = state.future;
  return { present: next, past: [state.present, ...state.past], future: rest, dirty: true, version: state.version + 1 };
}

export async function autosaveDraft<T>(state: HistoryState<T>): Promise<void> {
  try {
    await fetch('http://localhost:4202/homepage/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ data: state.present, version: state.version }),
    });
  } catch {
    // ignore autosave network errors for now
  }
}


