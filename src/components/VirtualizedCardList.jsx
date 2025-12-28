import React, { memo } from "react";
import { FixedSizeList } from "react-window";
import SortableCard from "./SortableCard";

function VirtualizedCardList({
  cards,
  listId,
  height = 400,
  itemHeight = 72,
  overscanCount = 5,
  onOpenCard,
}) {
  const Row = memo(({ index, style }) => {
    const card = cards[index];
    if (!card) return null;

    return (
      <div style={style}>
        <SortableCard
          card={card}
          listId={listId}
          onOpenCard={onOpenCard}
        />
      </div>
    );
  });

  return (
    <FixedSizeList
      height={height}
      itemCount={cards.length}
      itemSize={itemHeight}
      width="100%"
      overscanCount={overscanCount}
    >
      {Row}
    </FixedSizeList>
  );
}

export default memo(VirtualizedCardList);
