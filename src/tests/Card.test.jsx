import Card from "../components/Card";
import { vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { test, expect, afterEach } from "vitest";
import { BoardContext } from "../context/BoardProvider";

/**
 * Mock @dnd-kit/sortable's useSortable so tests don't render an overlay clone.
 * This must run BEFORE importing React component code that uses useSortable.
 */
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

test("renders card title, description, and tags", () => {
  const mockDispatch = vi.fn();

  render(
    <BoardContext.Provider value={{ dispatch: mockDispatch }}>
      <Card
        card={{
          id: "c1",
          title: "Test Card",
          description: "Card description",
          tags: ["a", "b"],
        }}
        listId="l1"
      />
    </BoardContext.Provider>
  );

  expect(screen.getByText("Test Card")).toBeTruthy();
  expect(screen.getByText("Card description")).toBeTruthy();
  expect(screen.getByText("a")).toBeTruthy();
  expect(screen.getByText("b")).toBeTruthy();
});


//   test("dispatches DELETE_CARD when delete button is clicked and confirm returns true", () => {
//     const mockDispatch = vi.fn();
//     vi.spyOn(window, "confirm").mockReturnValue(true);

//     render(
//       <BoardContext.Provider value={{ dispatch: mockDispatch }}>
//         <Card card={{ id: "c1", title: "Test Card" }} listId="l1" />
//         <Card card={{ id: "c2", title: "Test Card 2" }} listId="l2" />
//       </BoardContext.Provider>
//     );

//     // Select the delete button within the card with the specific id
//     const card = screen.getByTestId("card");  // Get the card by its test id
//     const deleteButton = within(card).getByLabelText("Delete card c1");
//     fireEvent.click(deleteButton);

//     expect(mockDispatch).toHaveBeenCalledWith({
//       type: "DELETE_CARD",
//       payload: { listId: "l1", cardId: "c1" },
//     });
//   });




// test("dispatches UPDATE_CARD when rename is used and prompt returns new name", () => {
//   const mockDispatch = vi.fn();
//   vi.spyOn(window, "prompt").mockReturnValue("Renamed Card");

//   render(
//     <BoardContext.Provider value={{ dispatch: mockDispatch }}>
//       <Card card={{ id: "c1", title: "Test Card" }} listId="l1" />
//     </BoardContext.Provider>
//   );

//   // Use a unique aria-label based on card id
//   const renameButton = screen.getByLabelText("Rename card c1");
//   fireEvent.click(renameButton);

//   const action = mockDispatch.mock.calls[0][0];

//   expect(action.type).toBe("UPDATE_CARD");
//   expect(action.payload.updates.title).toBe("Renamed Card");
// });
// //