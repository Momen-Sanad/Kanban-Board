import React from "react";
import { render, screen } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import Card from "../components/Card";
import { BoardContext } from "../context/BoardProvider";

test("renders card title and tags", () => {
  const mockDispatch = vi.fn();

  render(
    <BoardContext.Provider value={{ dispatch: mockDispatch }}>
      <Card
        card={{
          id: "c1",
          title: "Test Card",
          description: "desc",
          tags: ["a", "b"],
        }}
        listId="l1"
      />
    </BoardContext.Provider>
  );

  expect(screen.getByText("Test Card")).toBeTruthy();
  expect(screen.getByText(/desc/)).toBeTruthy();
  expect(screen.getByText("a")).toBeTruthy();
});
