import { memo, useContext, useMemo, useCallback, useState } from "react";
import { BoardContext } from "../context/BoardProvider";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import VirtualizedCardList from "./VirtualizedCardList";
import CardDetailModal from "./CardDetailModal";

const CARD_HEIGHT = 72;
const MAX_LIST_HEIGHT = 420;

function ListColumn({ list, onOpenCard }) {
  const { state, dispatch } = useContext(BoardContext);
  const [newCard, setNewCard] = useState(null); // For Add Card modal

  // Droppable hook for handling drag-and-drop
  const { setNodeRef } = useDroppable({ id: list.id });

  // Filtering out archived cards
  const visibleCards = useMemo(
    () => list.cards.filter((c) => !c.archived),
    [list.cards]
  );

  // Mapping over visible cards to get their IDs
  const cardIds = useMemo(() => visibleCards.map((c) => c.id), [visibleCards]);
  const listHeight = Math.min(MAX_LIST_HEIGHT, visibleCards.length * CARD_HEIGHT);

  // Handle opening the "Add Card" modal
  const handleAddCard = useCallback(() => {
    const tempCard = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isNew: true, // Flag to indicate it's not yet in the board
    };
    setNewCard(tempCard);
    onOpenCard?.(tempCard, list.id); // Calling onOpenCard if provided
  }, [onOpenCard, list.id]);

  // Handle confirming and adding the new card
  const handleConfirmNewCard = useCallback(
    (cardData) => {
      dispatch({
        type: "ADD_CARD",
        payload: { listId: list.id, card: { ...cardData, isNew: undefined } },
      });
      setNewCard(null); // Close the modal after confirming
    },
    [dispatch, list.id]
  );

  // Handle canceling the creation of the new card
  const handleCancelNewCard = useCallback(() => {
    setNewCard(null);
  }, []);

  // Handle renaming the list
  const handleRenameList = useCallback(() => {
    const newTitle = prompt("Rename list:", list.title);
    if (!newTitle || newTitle === list.title) return;

    dispatch({
      type: "UPDATE_LIST",
      payload: {
        listId: list.id,
        updates: { title: newTitle, updatedAt: Date.now() },
      },
    });
  }, [dispatch, list.id, list.title]);

  // Handle archiving the list
  const handleArchiveList = useCallback(() => {
    if (!confirm("Archive this list?")) return;

    dispatch({
      type: "ARCHIVE_LIST",
      payload: { listId: list.id },
    });
  }, [dispatch, list.id]);

  // Handle moving the list to another table
  const handleMoveTable = useCallback(
    (e) => {
      dispatch({
        type: "UPDATE_LIST",
        payload: {
          listId: list.id,
          updates: { tableId: e.target.value, updatedAt: Date.now() },
        },
      });
    },
    [dispatch, list.id]
  );

  return (
    <div ref={setNodeRef} className="bg-white p-4 rounded shadow w-full">
      {/* List header */}
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex-1">
          <h2 className="font-semibold">{list.title}</h2>

          <div className="mt-2">
            <select
              value={list.tableId}
              onChange={handleMoveTable}
              className="text-sm p-1 border rounded"
            >
              {state.tables.map((t) => (
                <option key={t.id} value={t.id}>
                  Move to {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1 ml-2">
          <button
            onClick={handleRenameList}
            className="text-blue-500 text-sm"
          >
            Rename
          </button>
          <button
            onClick={handleArchiveList}
            className="text-yellow-600 text-sm"
          >
            Archive
          </button>
        </div>
      </div>

      {/* Add card button */}
      <button
        onClick={handleAddCard}
        className="bg-blue-500 text-white p-2 rounded mb-3 w-full"
      >
        + Add Card
      </button>

      {/* Cards */}
      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <VirtualizedCardList
          cards={visibleCards}
          listId={list.id}
          height={listHeight}
          itemHeight={CARD_HEIGHT}
          onOpenCard={onOpenCard}
        />
      </SortableContext>

      {/* New Card Modal */}
      {newCard && (
        <CardDetailModal
          card={newCard}
          listId={list.id}
          onClose={handleCancelNewCard}
          onSave={handleConfirmNewCard}
        />
      )}
    </div>
  );
}

export default memo(ListColumn);
