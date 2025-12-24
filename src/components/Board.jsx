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

  const [activeCard, setActiveCard] = useState(null);
  const [modalCard, setModalCard] = useState(null);

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

  // ---------- DnD handlers ----------
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

      const sourceIndex = sourceList.cards.findIndex(
        (c) => c.id === active.id
      );

      let targetIndex =
        over.id === targetListId
          ? targetList.cards.length
          : targetList.cards.findIndex((c) => c.id === over.id);

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

  // ---------- modal helpers ----------
  const openCardModal = useCallback((card, listId) => {
    setModalCard({ card, listId });
  }, []);

  const closeCardModal = useCallback(() => {
    setModalCard(null);
  }, []);

  // ---------- render ----------
  return (
    <div className="p-6 flex justify-center">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* TABLES GRID */}
        <div className="tables">
          {state.tables.map((table) => {
            const listsForTable =
              table.id === "backlog"
                ? state.lists.filter(
                    (l) => l.tableId === "backlog" || l.archived
                  )
                : state.lists.filter(
                    (l) => l.tableId === table.id && !l.archived
                  );

            return (
              <div key={table.id} className="table-card">
                {/* Header */}
                <div className="table-card-header">
                  <div className="table-card-title">{table.title}</div>
                  <div className="table-card-sub">
                    {listsForTable.length} lists
                  </div>
                </div>

                {/* Body */}
                <div className="table-card-body">
                  {listsForTable.map((list) => (
                    <ListColumn
                      key={list.id}
                      list={list}
                      onOpenCard={(card, listId) =>
                        openCardModal(card, listId)
                      }
                    />
                  ))}

                  {/* Add list button (not in backlog) */}
                  {table.id !== "backlog" && (
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
                      className="w-full py-2 border-2 border-dashed rounded text-gray-500 hover:bg-gray-100"
                    >
                      + Add List
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeCard ? <Card card={activeCard} dragOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Card modal */}
      {modalCard && (
        <CardDetailModal
          card={modalCard.card}
          listId={modalCard.listId}
          onClose={closeCardModal}
        />
      )}
    </div>
  );
}

export default Board;
