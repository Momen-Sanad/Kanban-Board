import { describe, test, expect } from "vitest";
import { boardReducer } from "../context/boardReducer";

describe("boardReducer", () => {
  test("adds a card to a list", () => {
    const initial = {
      lists: [{ id: "1", cards: [] }],
      tables: [],
    };

    const state = boardReducer(initial, {
      type: "ADD_CARD",
      payload: {
        listId: "1",
        card: { id: "c1", title: "Hello" },
      },
    });

    const list = state.lists.find((l) => l.id === "1");
    expect(list).toBeDefined();
    expect(list.cards.length).toBe(1);
    expect(list.cards[0].id).toBe("c1");
    expect(list.cards[0].title).toBe("Hello");
  });

  test("moves a card between lists", () => {
    const initial = {
      lists: [
        { id: "a", cards: [{ id: "c1", title: "X" }] },
        { id: "b", cards: [] },
      ],
      tables: [],
    };

    const state = boardReducer(initial, {
      type: "MOVE_CARD",
      payload: {
        sourceListId: "a",
        targetListId: "b",
        cardId: "c1",
        targetIndex: 0,
      },
    });

    const from = state.lists.find((l) => l.id === "a");
    const to = state.lists.find((l) => l.id === "b");
    expect(from.cards.find((c) => c.id === "c1")).toBeUndefined();
    expect(to.cards.find((c) => c.id === "c1")).toBeDefined();
  });

  test("adds a new list", () => {
    const initial = {
      lists: [],
      tables: [],
    };

    const newList = { id: "2", title: "New List" };

    const state = boardReducer(initial, {
      type: "ADD_LIST",
      payload: newList,
    });

    const addedList = state.lists.find((l) => l.id === "2");
    expect(addedList).toBeDefined();
    expect(addedList.title).toBe("New List");
    expect(addedList.cards).toEqual([]);
  });

  test("updates a card", () => {
    const initial = {
      lists: [
        { id: "1", cards: [{ id: "c1", title: "Old Title" }] },
      ],
      tables: [],
    };

    const updatedCard = { title: "Updated Title" };

    const state = boardReducer(initial, {
      type: "UPDATE_CARD",
      payload: {
        listId: "1",
        cardId: "c1",
        updates: updatedCard,
      },
    });

    const card = state.lists[0].cards.find((c) => c.id === "c1");
    expect(card.title).toBe("Updated Title");
  });

  test("archives a list (DELETE_LIST)", () => {
    const initial = {
      lists: [
        { id: "1", title: "Archived List", archived: false },
      ],
      tables: [],
    };

    const state = boardReducer(initial, {
      type: "DELETE_LIST",
      payload: {
        listId: "1",
      },
    });

    const archivedList = state.lists.find((l) => l.id === "1");
    expect(archivedList.archived).toBe(true);
    expect(archivedList.tableId).toBe("backlog");
  });
});