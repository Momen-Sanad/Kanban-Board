import { useCallback, useRef, useState } from "react";

export default function useUndoRedo(reducer, initialPresent) {
  // history is kept in a ref for stability; we force re-renders via tick
  const historyRef = useRef({
    past: [],
    present: initialPresent,
    future: [],
  });

  const [, setTick] = useState(0);
  const notify = useCallback(() => setTick((t) => t + 1), []);

  const read = () => historyRef.current;

  const dispatch = useCallback(
    (action) => {
      const h = read();
      const newPresent = reducer(h.present, action);

      // if reducer returns same object (no change), don't record a history entry
      if (newPresent === h.present) return;

      historyRef.current = {
        past: [...h.past, h.present],
        present: newPresent,
        future: [],
      };
      notify();
    },
    [reducer, notify]
  );

  const undo = useCallback(() => {
    const h = read();
    if (h.past.length === 0) return;
    const previous = h.past[h.past.length - 1];
    const newPast = h.past.slice(0, -1);
    historyRef.current = {
      past: newPast,
      present: previous,
      future: [h.present, ...h.future],
    };
    notify();
  }, [notify]);

  const redo = useCallback(() => {
    const h = read();
    if (h.future.length === 0) return;
    const next = h.future[0];
    const newFuture = h.future.slice(1);
    historyRef.current = {
      past: [...h.past, h.present],
      present: next,
      future: newFuture,
    };
    notify();
  }, [notify]);

  const replace = useCallback(
    (newPresent) => {
      // Replace current present without touching past/future
      const h = read();
      historyRef.current = { ...h, present: newPresent };
      notify();
    },
    [notify]
  );

  return {
    state: read().present,
    dispatch,
    undo,
    redo,
    canUndo: read().past.length > 0,
    canRedo: read().future.length > 0,
    replace,
    // expose raw history for debugging
    history: historyRef.current,
  };
}
