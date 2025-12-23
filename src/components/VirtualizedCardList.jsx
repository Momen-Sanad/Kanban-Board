import React from "react";
import { FixedSizeList } from "react-window";
import Card from "./Card";

export default function VirtualizedCardList({
  cards,
  listId,
  height = 400,
  itemHeight = 72,
  overscanCount = 5,
  onOpenCard, // function(card, listId)
}) {
  const Row = React.memo(function Row({ index, style, data }) {
    const { cards, listId, onOpenCard } = data;
    const card = cards[index];
    if (!card) return null;

    return (
      <div style={style}>
        <Card card={card} listId={listId} onOpenCard={onOpenCard} />
      </div>
    );
  });

  return (
    <FixedSizeList
      height={height}
      itemCount={cards.length}
      itemSize={itemHeight}
      width="100%"
      itemData={{ cards, listId, onOpenCard }}
      overscanCount={overscanCount}
    >
      {Row}
    </FixedSizeList>
  );
}
