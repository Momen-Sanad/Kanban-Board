import React, { memo, useContext } from "react";
import { BoardContext } from "../context/BoardProvider";

function Card({
  card,
  listId,
  dragAttributes,
  dragListeners,
  isDragging,
  setNodeRef,
  setActivatorNodeRef,
  nodeStyle,
}) {
  const { dispatch } = useContext(BoardContext);

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
    if (!confirm("Delete this card?")) return;

    dispatch({
      type: "DELETE_CARD",
      payload: { listId, cardId: card.id },
    });
  }

  const description = card.description || "";
  const shortDesc =
    description.length > 80 ? description.slice(0, 77) + "…" : description;

  return (
    // apply the ref and the sortable style to the same DOM node
    <div
      ref={setNodeRef}
      style={nodeStyle}
      className="bg-gray-50 p-3 rounded mb-2 shadow-sm relative"
    >
      {/* Drag handle only on title */}
      <div
        ref={setActivatorNodeRef}
        {...dragAttributes}
        {...dragListeners}
        style={{
          touchAction: "none",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        className="font-medium mb-1 select-none drag-handle"
      >
        {card.title}
      </div>


      {shortDesc && (
        <div className="text-sm text-gray-600 mb-2">{shortDesc}</div>
      )}

      {card.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {card.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="absolute right-1 top-1 flex gap-1">
        <button
          onClick={handleRename}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-blue-500 text-xs"
        >
          Rename
        </button>
        <button
          onClick={handleDelete}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-red-500 text-xs"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default memo(Card);
