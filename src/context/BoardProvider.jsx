import React, { createContext, useEffect, useReducer } from "react";
import { boardReducer, initialBoardState } from "./boardReducer";
import { loadBoardState, saveBoardState } from "../services/storage";
import useUndoRedo from "../hooks/useUndoRedo";
import { useOfflineSync } from "../hooks/useOfflineSync";

export const BoardContext = createContext(null);

export function BoardProvider({ children }) {
  // load persisted board (present state)
  const storedState = loadBoardState() || initialBoardState;

  // useUndoRedo wraps your reducer and provides history controls
  const {
    state,
    dispatch,
    undo,
    redo,
    canUndo,
    canRedo,
    replace,
  } = useUndoRedo(boardReducer, storedState);

  // Integrate useOfflineSync to sync state with the offline storage
  useOfflineSync(state, dispatch);

  // Persist present state whenever it changes
  useEffect(() => {
    if (state && state.lists) {
      saveBoardState(state);
    }
  }, [state]);

  // Keyboard shortcuts: Cmd+Z = undo, Ctrl/Cmd+Y = redo
  useEffect(() => {
    function onKey(e) {
      const mod = e.ctrlKey;  // Always use the Ctrl key
  
      if (!mod) return;
  
      // Undo: Ctrl + Z
      if (e.key === "z" || e.key === "Z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
  
      // Redo: Ctrl + Y
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
        replace, // replace present state (e.g. after sync)
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
