import { renderHook, act } from "@testing-library/react";
import { test, expect } from "vitest";
import useUndoRedo from "../hooks/useUndoRedo";

test("undo and redo work correctly", () => {
  // small reducer used for this test
  const reducer = (state, action) => (action.type === "INC" ? state + 1 : state);
  const { result } = renderHook(() => useUndoRedo(reducer, 0));

  // dispatch increment
  act(() => {
    result.current.dispatch({ type: "INC" });
  });
  expect(result.current.state).toBe(1);

  // undo
  act(() => {
    result.current.undo();
  });
  expect(result.current.state).toBe(0);

  // redo
  act(() => {
    result.current.redo();
  });
  expect(result.current.state).toBe(1);
});
