import React, { useEffect, useRef, useState, useContext } from "react";
import { BoardContext } from "../context/BoardProvider";
import ConfirmDialog from "./ConfirmDialog";

function CardDetailModal({ card, listId, onClose }) {
  const { dispatch } = useContext(BoardContext);

  // Local editable copy of card fields
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [tags, setTags] = useState(card?.tags ? [...card.tags] : []);
  const [newTag, setNewTag] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const titleRef = useRef(null);

  // When the modal opens or card prop changes, initialize local state
  useEffect(() => {
    setTitle(card?.title ?? "");
    setDescription(card?.description ?? "");
    setTags(card?.tags ? [...card.tags] : []);
    setNewTag("");
    // focus the title input so user can start typing immediately
    setTimeout(() => {
      if (titleRef.current) titleRef.current.focus();
    }, 0);
  }, [card]);

  function addTag() {
    const t = newTag.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags((s) => [...s, t]);
    setNewTag("");
  }

  function removeTag(tag) {
    setTags((s) => s.filter((x) => x !== tag));
  }

  function handleSave() {
    dispatch({
      type: "UPDATE_CARD",
      payload: {
        listId,
        cardId: card.id,
        updates: {
          title: title,
          description: description,
          tags: tags,
          updatedAt: Date.now(),
        },
      },
    });
    onClose();
  }

  function handleDeleteConfirmed() {
    dispatch({
      type: "DELETE_CARD",
      payload: { listId, cardId: card.id },
    });
    setConfirmOpen(false);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded shadow-lg w-[26rem] max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">Card details</h2>
              <p className="text-sm text-gray-500">Edit card information</p>
            </div>
            <button onClick={onClose} className="text-gray-500">✕</button>
          </div>

          <label className="block mb-2 font-medium">Title</label>
          <input
            ref={titleRef}
            className="w-full p-2 border rounded mb-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card title"
          />

          <label className="block mb-2 font-medium">Description</label>
          <textarea
            className="w-full p-2 border rounded mb-4"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
          />

          <label className="block mb-2 font-medium">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((t) => (
              <div key={t} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                <span className="text-sm">{t}</span>
                <button onClick={() => removeTag(t)} className="text-red-500 text-sm">×</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag"
              className="flex-1 p-2 border rounded"
            />
            <button onClick={addTag} className="px-3 py-2 bg-blue-500 text-white rounded">Add</button>
          </div>

          <div className="flex justify-between items-center gap-3">
            <div className="flex gap-2">
              <button onClick={() => setConfirmOpen(true)} className="px-3 py-2 bg-red-500 text-white rounded">Delete Card</button>
            </div>

            <div className="flex gap-2">
              <button onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={handleSave} className="px-3 py-2 bg-green-500 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm delete card */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete card"
        message="Are you sure you want to delete this card?"
        confirmText="Delete"
        destructive
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default CardDetailModal;
