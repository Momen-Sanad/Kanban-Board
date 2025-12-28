export const initialBoardState = {
  updatedAt: Date.now(),
  // top-level tables (can customize labels)
  tables: [
    { id: "backlog", title: "Backlog" },
    { id: "doing", title: "Doing" },
    { id: "review", title: "Review" },
    { id: "done", title: "Done" },
  ],
  lists: [], // each list: { id, title, cards: [], tableId, archived?, updatedAt }
};

export function boardReducer(state, action) {
  console.log("Reducer action:", action);

  switch (action.type) {
    case "ADD_LIST": {
      const newList = {
        ...(action.payload || {}),
        cards: (action.payload && action.payload.cards) || [],
        tableId: (action.payload && action.payload.tableId) || "doing",
        archived: false,
        updatedAt: Date.now(),
      };

      return {
        ...state,
        updatedAt: Date.now(),
        lists: [...state.lists, newList],
      };
    }

    case "UPDATE_LIST": {
      const { listId, updates } = action.payload;
      return {
        ...state,
        updatedAt: Date.now(),
        lists: state.lists.map((list) =>
          list.id === listId ? { ...list, ...updates, updatedAt: Date.now() } : list
        ),
      };
    }

    case "ARCHIVE_LIST": {
      const { listId } = action.payload;
      return {
        ...state,
        updatedAt: Date.now(),
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                archived: true,
                tableId: "backlog",
                updatedAt: Date.now(),
              }
            : list
        ),
      };
    }

    case "DELETE_LIST": {
      const { listId } = action.payload;
      return {
        ...state,
        updatedAt: Date.now(),
        lists: state.lists.filter((list) => list.id !== listId),
      };
    }


    case "ADD_CARD": {
      return {
        ...state,
        updatedAt: Date.now(),
        lists: state.lists.map((list) =>
          list.id === action.payload.listId
            ? {
                ...list,
                updatedAt: Date.now(),
                cards: [...(list.cards || []), { ...action.payload.card, updatedAt: Date.now() }],
              }
            : list
        ),
      };
    }

    case "UPDATE_CARD": {
      const { listId, cardId, updates } = action.payload;
      return {
        ...state,
        updatedAt: Date.now(),
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                updatedAt: Date.now(),
                cards: list.cards.map((card) =>
                  card.id === cardId ? { ...card, ...updates, updatedAt: Date.now() } : card
                ),
              }
            : list
        ),
      };
    }

    case "DELETE_CARD": {
      const { listId, cardId } = action.payload;
      return {
        ...state,
        updatedAt: Date.now(),
        lists: state.lists.map((list) =>
          list.id === listId
            ? { ...list, updatedAt: Date.now(), cards: list.cards.filter((c) => c.id !== cardId) }
            : list
        ),
      };
    }

    case "MOVE_CARD": {
      const { sourceListId, targetListId, cardId, targetIndex } = action.payload;

      const sourceList = state.lists.find((l) => l.id === sourceListId);
      const targetList = state.lists.find((l) => l.id === targetListId);

      if (!sourceList || !targetList) return state;

      const cardIndex = sourceList.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return state;

      const card = sourceList.cards[cardIndex];

      // same-list reorder
      if (sourceListId === targetListId) {
        const newCards = [...sourceList.cards];
        newCards.splice(cardIndex, 1);
        newCards.splice(targetIndex, 0, card);

        return {
          ...state,
          updatedAt: Date.now(),
          lists: state.lists.map((l) =>
            l.id === sourceListId ? { ...l, cards: newCards, updatedAt: Date.now() } : l
          ),
        };
      }

      // cross-list move
      const newSourceCards = [...sourceList.cards];
      newSourceCards.splice(cardIndex, 1);

      const newTargetCards = [...targetList.cards];
      newTargetCards.splice(targetIndex, 0, { ...card, updatedAt: Date.now() });

      return {
        ...state,
        updatedAt: Date.now(),
        lists: state.lists.map((l) => {
          if (l.id === sourceListId) return { ...l, cards: newSourceCards, updatedAt: Date.now() };
          if (l.id === targetListId) return { ...l, cards: newTargetCards, updatedAt: Date.now() };
          return l;
        }),
      };
    }

    case "HYDRATE": {
    const payload = action.payload || {};
    return {
        ...initialBoardState,
        ...payload,
        lists: Array.isArray(payload.lists) ? payload.lists : initialBoardState.lists,
        tables: Array.isArray(payload.tables) ? payload.tables : initialBoardState.tables,
    };
    }


    default:
      return state;
  }
}