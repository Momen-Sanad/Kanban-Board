// src/components/Card.jsx
import React, { memo, useContext } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BoardContext } from "../context/BoardProvider";

/**
 * Card preview shown inside list column
 * - shows title, truncated description, and up to 3 tags
 * - drag handle (☰), rename & delete actions (no archive)
 * - clicking body opens CardDetailModal via onOpenCard
 */
function Card({ card, listId, dragOverlay = false, onOpenCard }) {
  const { dispatch } = useContext(BoardContext);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = {
    transform: dragOverlay ? undefined : CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : "auto",
  };

  function handleRename(e) {
    e.stopPropagation();
    const newTitle = prompt("Rename card:", card.title);
    if (!newTitle || newTitle === card.title) return;

    dispatch({
      type: "UPDATE_CARD",
      payload: {
        listId,
        cardId: card.id,
        updates: { title: newTitle, updatedAt: Date.now() },
      },
    });
  }

  function handleDelete(e) {
    e.stopPropagation();
    // use ConfirmDialog elsewhere; temporary fallback:
    if (!confirm("Delete this card?")) return;

    dispatch({
      type: "DELETE_CARD",
      payload: { listId, cardId: card.id },
    });
  }

  function handleOpenModal(e) {
    if (e.button && e.button !== 0) return;
    if (onOpenCard) onOpenCard(card, listId);
  }

  const description = card.description || "";
  const shortDesc =
    description.length > 80 ? description.slice(0, 77) + "…" : description;

return (
  <div
    ref={setNodeRef}
    style={style}
    className={`bg-gray-50 p-3 rounded mb-2 shadow-sm relative ${
      dragOverlay ? "w-56 shadow-lg" : ""
    }`}
    onClick={handleOpenModal}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleOpenModal(e);
    }}
  >
    {/* Title */}
    <div
      {...attributes}  // attach drag attributes to the title itself
      {...listeners}   // attach drag listeners to the title itself
      className="font-medium mb-1 cursor-move"  // Added cursor for drag indication
    >
      {card.title}
    </div>

    {/* Short description */}
    {shortDesc ? (
      <div className="text-sm text-gray-600 mb-2">{shortDesc}</div>
    ) : null}

    {/* Tags */}
    {card.tags && card.tags.length > 0 && (
      <div className="flex flex-wrap gap-1 mb-1">
        {card.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded"
          >
            {t}
          </span>
        ))}
        {card.tags.length > 3 && (
          <span className="text-xs text-gray-500 px-1">+{card.tags.length - 3}</span>
        )}
      </div>
    )}

    {/* Inline actions: rename & delete (no archive) */}
    <div className="absolute right-1 top-1 flex gap-1">
      <button
        onClick={handleRename}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-blue-500 text-xs hover:underline"
        aria-label="Rename card"
      >
        Rename
      </button>

      <button
        onClick={handleDelete}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-red-500 text-xs hover:underline"
        aria-label="Delete card"
      >
        Delete
      </button>
    </div>
  </div>
);

}

export default memo(
  Card,
  (prev, next) =>
    prev.card.id === next.card.id &&
    prev.card.title === next.card.title &&
    prev.listId === next.listId &&
    prev.dragOverlay === next.dragOverlay
);
