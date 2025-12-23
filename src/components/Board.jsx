import { useCallback, useState, useContext, useEffect, useRef  } from "react";
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

  const lastAddedCardIdRef = useRef(null);
  const { state, dispatch } = useContext(BoardContext);

  const [activeCard, setActiveCard] = useState(null); // used for DragOverlay
  const [modalCard, setModalCard] = useState(null); // { card, listId } or null

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  function handleAddList() {
    const title = prompt("List name?");
    if (!title) return;

    dispatch({
      type: "ADD_LIST",
      payload: {
        id: crypto.randomUUID(),
        title,
        cards: [],
        updatedAt: Date.now(),
      },
    });
  }

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

  // ---------- modal open/close helpers ----------
  const openCardModal = useCallback((card, listId) => {
    setModalCard({ card, listId });
  }, []);

  const closeCardModal = useCallback(() => {
    setModalCard(null);
  }, []);


  useEffect(() => {
    // Find the most recently added card
    for (const list of state.lists) {
      for (const card of list.cards) {
        if (card.id !== lastAddedCardIdRef.current && card.title === "New card") {
          lastAddedCardIdRef.current = card.id;
          setModalCard({ card, listId: list.id });
          return;
        }
      }
    }
  }, [state.lists]);


  return (
    <div className="p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 mb-4">
          {state.lists.map((list) => (
            <ListColumn
              key={list.id}
              list={list}
              onOpenCard={(card, listId) => openCardModal(card, listId)}
            />
          ))}

          <button
            onClick={handleAddList}
            className="w-64 h-20 border-2 border-dashed rounded text-gray-500 hover:bg-gray-100"
          >
            + Add List
          </button>
        </div>

        {/* Drag overlay shows the dragged card while dragging */}
        <DragOverlay>
          {activeCard ? <Card card={activeCard} dragOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Card detail modal (open when modalCard is set) */}
      {modalCard ? (
        <CardDetailModal
          card={modalCard.card}
          listId={modalCard.listId}
          onClose={closeCardModal}
        />
      ) : null}
    </div>
  );
}

export default Board;
