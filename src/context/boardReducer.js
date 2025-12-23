export const initialBoardState = {
  updatedAt: Date.now(),
  lists: [],
};

export function boardReducer(state, action) {
  console.log("Reducer action:", action);

  switch (action.type) {
    case "ADD_LIST":
      return {
      ...state,
      updatedAt: Date.now(),
      lists: [
      ...state.lists,
      {
          ...action.payload,
          updatedAt: Date.now(),
      },
      ],
    };
    case "UPDATE_LIST": {
    const { listId, updates } = action.payload;
      return {
          ...state,
          lists: state.lists.map((list) =>
          list.id === listId ? { ...list, ...updates, updatedAt: Date.now() } : list
          ),
      };
    }
  
    case "DELETE_LIST": {
      const { listId } = action.payload;
      return {
          ...state,
          lists: state.lists.filter((list) => list.id !== listId),
      };
    }


    case "HYDRATE":
      return action.payload;

    case "ADD_CARD":
    return {
      ...state,
      updatedAt: Date.now(),
      lists: state.lists.map((list) =>
      list.id === action.payload.listId
          ? {
              ...list,
              updatedAt: Date.now(),
              cards: [
              ...list.cards,
              { ...action.payload.card, updatedAt: Date.now() },
              ],
          }
          : list
      ),
    };
    case "UPDATE_CARD": {
        const { listId, cardId, updates } = action.payload;
        return {
            ...state,
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
    case "OPEN_CARD_MODAL":
    return {
        ...state,
        activeCard: action.payload.card,
        activeListId: action.payload.listId,
    };

    case "CLOSE_CARD_MODAL":
    return {
        ...state,
        activeCard: null,
        activeListId: null,
    };

    case "DELETE_CARD": {
        const { listId, cardId } = action.payload;
        return {
            ...state,
            lists: state.lists.map((list) =>
            list.id === listId
                ? {
                    ...list,
                    updatedAt: Date.now(),
                    cards: list.cards.filter((card) => card.id !== cardId),
                }
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

        const cardToMove = sourceList.cards[cardIndex];
        const now = Date.now();

        // ---- SAME LIST REORDER ----
        if (sourceListId === targetListId) {
            const newCards = [...sourceList.cards];
            newCards.splice(cardIndex, 1); // remove
            newCards.splice(targetIndex, 0, cardToMove); // insert

            // Create updated source list with the timestamp
            const updatedSourceList = {
            ...sourceList,
            updatedAt: now,
            cards: newCards,
            };

            return {
            ...state,
            updatedAt: now,
            lists: state.lists.map((list) =>
                list.id === sourceListId ? updatedSourceList : list
            ),
            };
        }

        // ---- CROSS LIST MOVE ----
        const updatedSourceList = {
            ...sourceList,
            updatedAt: now,
            cards: sourceList.cards.filter((card) => card.id !== cardId), // remove card from source
        };

        const updatedTargetList = {
            ...targetList,
            updatedAt: now,
            cards: [
            ...targetList.cards.slice(0, targetIndex),
            { ...cardToMove, updatedAt: now }, // add card to target with timestamp
            ...targetList.cards.slice(targetIndex),
            ],
        };

        return {
            ...state,
            updatedAt: now,
            lists: state.lists
            .map((l) => (l.id === sourceListId ? updatedSourceList : l))
            .map((l) => (l.id === targetListId ? updatedTargetList : l)),
        };
    }


    default:
      return state;
  }
}
