import { test, expect, beforeEach } from "vitest";
import { saveBoardState, loadBoardState } from "../services/storage";

// Minimal localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

beforeEach(() => {
  global.localStorage = localStorageMock;
  localStorage.clear();
});

test("persists and restores board state", () => {
  const state = { lists: [{ id: "1", cards: [] }], tables: [] };

  saveBoardState(state);
  const restored = loadBoardState();

  expect(restored).toBeTruthy();
  expect(restored.lists.length).toBe(1);
  expect(restored.lists[0].id).toBe("1");
});
