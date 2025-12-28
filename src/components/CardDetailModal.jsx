import React, { useEffect, useState } from "react";

export default function CardDetailModal({ mode: _mode, card, listId, onSave, onDelete, onClose }) {
  // If a mode prop isn't passed, infer it
  const mode = _mode || (card ? "edit" : "create");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (card) {
      setTitle(card.title || "");
      setDescription(card.description || "");
      setTags(card.tags || []);
    } else {
      setTitle("");
      setDescription("");
      setTags([]);
    }
    setTagInput("");
  }, [card]);

  function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags((s) => [...s, t]);
    setTagInput("");
  }

  function removeTag(t) {
    setTags((s) => s.filter((x) => x !== t));
  }

  function handleSave() {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      tags,
    };

    onSave?.(payload);
    // onSave responsibility (Board.jsx) closes modal
    // but in case caller didn't, close here:
    onClose?.();
  }

  function handleDelete() {
    if (!confirm("Delete this card?")) return;
    onDelete?.();
    onClose?.();
  }

  return (
    // visible backdrop + centered modal — avoid using .modal (it had display:none)
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-xl p-6" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-4">
          <h2 className="modal-title">{mode === "create" ? "New Card" : "Edit Card"}</h2>
          <button onClick={() => onClose?.()} className="close-btn" aria-label="Close">✕</button>
        </div>

        <div className="form-group">
          <label className="font-semibold mb-2">Title <span className="required">*</span></label>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="font-semibold mb-2">Description</label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label className="font-semibold mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              placeholder="Add tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-1 border p-2 rounded"
            />
            <button onClick={addTag} className="btn btn-styled">Add</button>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => removeTag(t)}
                className="text-xs bg-blue-100 px-2 py-1 rounded"
                type="button"
              >
                {t} ✕
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div>
            {mode === "edit" && (
              <button onClick={handleDelete} className="text-red-600">
                Delete
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => onClose?.()} className="px-3 py-2">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary px-4 py-2">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
