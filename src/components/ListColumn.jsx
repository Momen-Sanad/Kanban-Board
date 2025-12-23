import { memo, useContext, useMemo, useCallback } from "react";
import { BoardContext } from "../context/BoardProvider";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import VirtualizedCardList from "./VirtualizedCardList";

const CARD_HEIGHT = 72;
const MAX_LIST_HEIGHT = 420;

function ListColumn({ list, onOpenCard }) {
  const { dispatch } = useContext(BoardContext);

  const { isOver, setNodeRef } = useDroppable({
    id: list.id,
  });

  const cardIds = useMemo(() => list.cards.map((c) => c.id), [list.cards]);

  // Create card with empty fields and open modal so user can type title/description/tags
  const handleAddCard = useCallback(() => {
    const newCard = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Persist to state
    dispatch({
      type: "ADD_CARD",
      payload: { listId: list.id, card: newCard },
    });

    // Immediately request opening the modal with the new card object.
    // Board will render the modal using this object (and the reducer has the card too).
    if (typeof onOpenCard === "function") {
      onOpenCard(newCard, list.id);
    }
  }, [dispatch, list.id, onOpenCard]);

  const handleRenameList = useCallback(() => {
    const newTitle = prompt("Rename list:", list.title);
    if (!newTitle || newTitle === list.title) return;

    dispatch({
      type: "UPDATE_LIST",
      payload: { listId: list.id, updates: { title: newTitle, updatedAt: Date.now() } },
    });
  }, [dispatch, list.id, list.title]);

  const handleArchiveList = useCallback(() => {
    if (!confirm("Archive this list?")) return;

    dispatch({
      type: "DELETE_LIST",
      payload: { listId: list.id },
    });
  }, [dispatch, list.id]);

  const listHeight = Math.min(MAX_LIST_HEIGHT, list.cards.length * CARD_HEIGHT);

  return (
    <div
      ref={setNodeRef}
      className={`bg-white p-4 rounded shadow w-64 ${
        isOver ? "border-2 border-dashed border-blue-500" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold">{list.title}</h2>
        <div className="flex gap-2">
          <button onClick={handleRenameList} className="text-blue-500 text-sm">Rename</button>
          <button onClick={handleArchiveList} className="text-red-500 text-sm">Archive</button>
        </div>
      </div>

      <button onClick={handleAddCard} className="bg-blue-500 text-white p-2 rounded mb-3 w-full">
        + Add Card
      </button>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <VirtualizedCardList
          cards={list.cards}
          listId={list.id}
          height={listHeight}
          itemHeight={CARD_HEIGHT}
          onOpenCard={onOpenCard}
        />
      </SortableContext>
    </div>
  );
}

export default memo(ListColumn);
