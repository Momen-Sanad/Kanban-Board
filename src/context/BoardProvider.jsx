// src/context/BoardProvider.js
import React, { createContext, useEffect } from "react";
import { boardReducer, initialBoardState } from "./boardReducer";
import { loadBoardState, saveBoardState } from "../services/storage";
import useUndoRedo from "../hooks/useUndoRedo";
import { useOfflineSync } from "../hooks/useOfflineSync";

export const BoardContext = createContext(null);

export function BoardProvider({ children }) {
  // load persisted board (may be old / missing new fields)
  const rawStoredState = loadBoardState();

  // SAFELY MERGE stored state with current initial shape
  const mergedInitialState = rawStoredState
    ? {
        ...initialBoardState,
        ...rawStoredState,
        lists: Array.isArray(rawStoredState.lists)
          ? rawStoredState.lists
          : initialBoardState.lists,
        tables: Array.isArray(rawStoredState.tables)
          ? rawStoredState.tables
          : initialBoardState.tables,
      }
    : initialBoardState;

  // useUndoRedo wraps reducer + provides history
  const {
    state,
    dispatch,
    undo,
    redo,
    canUndo,
    canRedo,
    replace,
  } = useUndoRedo(boardReducer, mergedInitialState);

  // Offline sync (queue + retry + background sync)
  useOfflineSync(state, dispatch);

  // Persist present state whenever it changes
  useEffect(() => {
    if (state && Array.isArray(state.lists)) {
      saveBoardState(state);
    }
  }, [state]);

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y
  useEffect(() => {
    function onKey(e) {
      if (!e.ctrlKey) return;

      // Undo
      if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }

      // Redo
      if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  return (
    <BoardContext.Provider
      value={{
        state,
        dispatch,
        undo,
        redo,
        canUndo,
        canRedo,
        replace, // used by sync / hydrate
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
