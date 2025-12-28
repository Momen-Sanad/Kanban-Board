import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Card from "./Card";

export default function SortableCard({ card, listId, onOpenCard }) {
  const {
    setNodeRef,
    setActivatorNodeRef, // ✅ REQUIRED
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <Card
      card={card}
      listId={listId}
      onOpenCard={onOpenCard}
      setNodeRef={setNodeRef}
      setActivatorNodeRef={setActivatorNodeRef}
      dragAttributes={attributes}
      dragListeners={listeners}
      isDragging={isDragging}
      nodeStyle={style}
    />
  );
}
