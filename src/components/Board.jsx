// src/components/Board.jsx
import { useCallback, useState, useContext, useRef, useEffect } from "react";
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
  const [modalCard, setModalCard] = useState(null); // { card, listId } or null

  // Inline add-list UI state
  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const newListInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
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

  // ---------- DnD ----------
  const handleDragStart = useCallback(
    (event) => {
      setActiveCard(findCardById(event.active.id));
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

      const sourceIndex = sourceList.cards.findIndex((c) => c.id === active.id);

      let targetIndex;
      if (over.id === targetList.id) {
        targetIndex = targetList.cards.length;
      } else {
        targetIndex = targetList.cards.findIndex((c) => c.id === over.id);
      }

      if (sourceList.id === targetList.id && sourceIndex < targetIndex) {
        targetIndex -= 1;
      }

      dispatch({
        type: "MOVE_CARD",
        payload: {
          sourceListId: sourceList.id,
          targetListId: targetList.id,
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

  // ---------- Global Add List (inline) ----------
  const handleOpenAddList = useCallback(() => {
    setAddingList(true);
    setNewListName("");
  }, []);

  useEffect(() => {
    if (addingList && newListInputRef.current) {
      const t = setTimeout(() => newListInputRef.current.focus(), 5);
      return () => clearTimeout(t);
    }
  }, [addingList]);

  const createList = useCallback(
    (title) => {
      const finalTitle = (title || "").trim();
      if (!finalTitle) return;

      const defaultTable = state.tables.find((t) => t.id !== "backlog") || state.tables[0];

      dispatch({
        type: "ADD_LIST",
        payload: {
          id: crypto.randomUUID(),
          title: finalTitle,
          cards: [],
          tableId: defaultTable?.id,
          updatedAt: Date.now(),
        },
      });
    },
    [dispatch, state.tables]
  );

  function handleAddListKeyDown(e) {
    if (e.key === "Enter") {
      createList(newListName);
      setAddingList(false);
      setNewListName("");
    } else if (e.key === "Escape") {
      setAddingList(false);
      setNewListName("");
    }
  }

  function handleAddListBlur() {
    if (newListName.trim()) {
      createList(newListName);
    }
    setAddingList(false);
    setNewListName("");
  }

  // ---------- Global Add Card ----------
  const handleAddCard = useCallback(() => {
    if (!state.lists || state.lists.length === 0) {
      alert("Please create a list first");
      return;
    }
    const firstList = state.lists[0];
    setModalCard({ card: null, listId: firstList.id });
  }, [state.lists]);

  // NOTE: We intentionally DO NOT pass an onOpenCard handler to ListColumn anymore.
  // This prevents clicking a card from opening the edit modal and allows press+drag to work naturally.

  return (
    <div className="board-container">
      {/* Top controls — single Add List and Add Card (test-friendly) */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", paddingBottom: 12 }}>
        {!addingList ? (
          <button
            className="btn btn-primary"
            onClick={handleOpenAddList}
            data-testid="global-add-list"
          >
            + Add List
          </button>
        ) : (
          <input
            ref={newListInputRef}
            placeholder="List name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={handleAddListKeyDown}
            onBlur={handleAddListBlur}
            className="form-group"
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--color-border)", minWidth: 220 }}
          />
        )}

        <button
          className="btn btn-primary"
          onClick={handleAddCard}
          data-testid="global-add-card"
        >
          + Add Card
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="kanban-board">
          {state.tables.map((table) => {
            const listsForTable =
              table.id === "backlog"
                ? state.lists.filter((l) => l.tableId === "backlog" || l.archived)
                : state.lists.filter((l) => l.tableId === table.id && !l.archived);

            return (
              <section key={table.id} className="kanban-column" id={`column-${table.id}`} data-testid={`column-${table.id}`}>
                <div className="column-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <span>{table.title}</span>
                  <span className="task-count">{listsForTable.length}</span>
                </div>

                <div className="task-list" role="list">
                  {listsForTable.map((list) => (
                    // removed onOpenCard so clicks won't open the modal; cards remain draggable
                    <ListColumn key={list.id} list={list} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <DragOverlay>{activeCard ? <Card card={activeCard} dragOverlay /> : null}</DragOverlay>
      </DndContext>

      {modalCard && (
        <CardDetailModal
          card={modalCard.card}
          listId={modalCard.listId}
          onSave={(cardData) => {
            if (modalCard.card) {
              dispatch({
                type: "UPDATE_CARD",
                payload: {
                  listId: modalCard.listId,
                  cardId: modalCard.card.id,
                  updates: { ...cardData, updatedAt: Date.now() },
                },
              });
            } else {
              dispatch({
                type: "ADD_CARD",
                payload: {
                  listId: modalCard.listId,
                  card: {
                    id: crypto.randomUUID(),
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    ...cardData,
                  },
                },
              });
            }
            setModalCard(null);
          }}
          onDelete={() => {
            if (modalCard.card) {
              dispatch({
                type: "DELETE_CARD",
                payload: { listId: modalCard.listId, cardId: modalCard.card.id },
              });
            }
            setModalCard(null);
          }}
          onClose={() => setModalCard(null)}
        />
      )}
    </div>
  );
}

export default Board;
