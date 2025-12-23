export function mergeBoardState(local, remote) {
  if (!local) return remote;
  if (!remote) return local;

  // Board-level LWW
  if (remote.updatedAt > local.updatedAt) {
    return remote;
  }

  const mergedLists = local.lists.map((localList) => {
    const remoteList = remote.lists.find((l) => l.id === localList.id);
    if (!remoteList) return localList;

    if (remoteList.updatedAt > localList.updatedAt) {
      return remoteList;
    }

    const mergedCards = localList.cards.map((localCard) => {
      const remoteCard = remoteList.cards.find(
        (c) => c.id === localCard.id
      );
      if (!remoteCard) return localCard;

      return remoteCard.updatedAt > localCard.updatedAt
        ? remoteCard
        : localCard;
    });

    return {
      ...localList,
      cards: mergedCards,
    };
  });

  return {
    ...local,
    lists: mergedLists,
  };
}