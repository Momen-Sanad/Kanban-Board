// src/tests/BoardProvider.test.jsx
import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from "@testing-library/react";
import { BoardProvider, BoardContext } from "../context/BoardProvider";
import { loadBoardState } from "../services/storage";
import { loadBoardFromIDB } from "../services/indexedDb";

vi.mock("../services/storage", () => ({
  loadBoardState: vi.fn(),
  saveBoardState: vi.fn(),
}));

vi.mock("../services/indexedDb", () => ({
  loadBoardFromIDB: vi.fn(),
  saveBoardToIDB: vi.fn(),
}));

describe("BoardProvider", () => {
  test("context initializes with state", async () => {
    loadBoardState.mockReturnValue({ lists: [] });

    render(
      <BoardProvider>
        <BoardContext.Consumer>
          {({ state }) => {
            expect(state).toBeDefined();
            expect(state.lists).toEqual([]);
            return null;
          }}
        </BoardContext.Consumer>
      </BoardProvider>
    );
  });

  test("dispatch updates state", async () => {
    const mockState = { lists: [{ id: "1", title: "Test List" }] };
    const mockDispatch = vi.fn();

    render(
      <BoardContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
        <div>Test</div>
      </BoardContext.Provider>
    );

    mockDispatch({ type: "ADD_LIST", payload: { id: "2", title: "New List" } });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  test("offline sync: initializes with IDB state (async)", async () => {
    loadBoardFromIDB.mockResolvedValue({ lists: [{ id: "1", title: "Synced List", cards: [] }] });

    // Render DOM output of provider state so we can query for the synced title
    const Wrapper = () => (
      <BoardProvider>
        <BoardContext.Consumer>
          {({ state }) => (
            <div>
              {state.lists.map((l) => (
                <div key={l.id} data-testid="list-title">
                  {l.title}
                </div>
              ))}
            </div>
          )}
        </BoardContext.Consumer>
      </BoardProvider>
    );

    render(<Wrapper />);

    // Wait for the provider to call the IDB loader and update state
    await waitFor(() => expect(loadBoardFromIDB).toHaveBeenCalled());
    expect(await screen.findByText("Synced List")).toBeTruthy();
  });
});
