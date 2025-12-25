// src/components/Board.jsx
import { useCallback, useState, useContext } from "react";
import { BoardContext } from "../context/BoardProvider";
import ListColumn from "./ListColumn";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Card from "./Card";
import CardDetailModal from "./CardDetailModal";

function Board() {
  const { state, dispatch } = useContext(BoardContext);

  const [activeCard, setActiveCard] = useState(null); // used for DragOverlay
  const [modalCard, setModalCard] = useState(null); // { card, listId } or null

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // ---------- helpers ----------
  const findListByCardId = useCallback(
    (cardId) => state.lists.find((l) => l.cards.some((c) => c.id === cardId)),
    [state.lists]
  );

  const findListById = useCallback(
    (listId) => state.lists.find((l) => l.id === listId),
    [state.lists]
  );

  const findCardById = useCallback(
    (cardId) => {
      const list = findListByCardId(cardId);
      return list?.cards.find((c) => c.id === cardId) ?? null;
    },
    [findListByCardId]
  );

  // ---------- DnD handlers (same as before) ----------
  const handleDragStart = useCallback(
    (event) => {
      const card = findCardById(event.active.id);
      setActiveCard(card);
    },
    [findCardById]
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        setActiveCard(null);
        return;
      }

      const sourceList = findListByCardId(active.id);
      const targetList = findListByCardId(over.id) || findListById(over.id);

      if (!sourceList || !targetList) {
        setActiveCard(null);
        return;
      }

      const sourceListId = sourceList.id;
      const targetListId = targetList.id;

      const sourceIndex = sourceList.cards.findIndex((c) => c.id === active.id);

      let targetIndex;
      if (over.id === targetListId) {
        targetIndex = targetList.cards.length;
      } else {
        targetIndex = targetList.cards.findIndex((c) => c.id === over.id);
      }

      if (sourceListId === targetListId && sourceIndex < targetIndex) {
        targetIndex -= 1;
      }

      dispatch({
        type: "MOVE_CARD",
        payload: {
          sourceListId,
          targetListId,
          cardId: active.id,
          targetIndex,
        },
      });

      setActiveCard(null);
    },
    [dispatch, findListByCardId, findListById]
  );

  const handleDragCancel = useCallback(() => {
    setActiveCard(null);
  }, []);

  // modal helpers
  const openCardModal = useCallback((card, listId) => {
    setModalCard({ card, listId });
  }, []);

  const closeCardModal = useCallback(() => {
    setModalCard(null);
  }, []);

  // Render tables as four big "kanban-column" cards
  return (
    <div className="board-container">
      {/* Optional Board header could be placed here if you have one */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Main grid with four lanes */}
        <div className="kanban-board">
          {state.tables.map((table) => {
            // backlog shows archived lists as well
            const listsForTable =
              table.id === "backlog"
                ? state.lists.filter((l) => l.tableId === "backlog" || l.archived)
                : state.lists.filter((l) => l.tableId === table.id && !l.archived);

            return (
              <section key={table.id} className="kanban-column" id={`column-${table.id}`}>
                {/* Column header */}
                <div className="column-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <span>{table.title}</span>
                  <span className="task-count">{listsForTable.length}</span>
                </div>

                {/* Task-list area (contains your ListColumn components stacked vertically) */}
                <div className="task-list" role="list">
                  {listsForTable.map((list) => (
                    <ListColumn
                      key={list.id}
                      list={list}
                      onOpenCard={(card, listId) => openCardModal(card, listId)}
                    />
                  ))}

                  {/* Add-list button (not shown for backlog) */}
                  {table.id !== "backlog" && (
                    <div style={{ padding: 12 }}>
                      <button
                        onClick={() => {
                          const title = prompt("List name?");
                          if (!title) return;
                          dispatch({
                            type: "ADD_LIST",
                            payload: {
                              id: crypto.randomUUID(),
                              title,
                              cards: [],
                              tableId: table.id,
                              updatedAt: Date.now(),
                            },
                          });
                        }}
                        className="btn btn-primary"
                      >
                        + Add List
                      </button>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* Drag overlay shows the dragged card while dragging */}
        <DragOverlay>{activeCard ? <Card card={activeCard} dragOverlay /> : null}</DragOverlay>
      </DndContext>

      {/* Card detail modal (open when modalCard is set) */}
      {modalCard ? (
        <CardDetailModal card={modalCard.card} listId={modalCard.listId} onClose={closeCardModal} />
      ) : null}
    </div>
  );
}

export default Board;
