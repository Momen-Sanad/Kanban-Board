import { useContext } from "react";
import { BoardContext } from "../context/BoardProvider";

function Toolbar() {
  const { undo, redo, canUndo, canRedo } = useContext(BoardContext);

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={undo}
        disabled={!canUndo}
        className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
      >
        Undo
      </button>

      <button
        onClick={redo}
        disabled={!canRedo}
        className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
      >
        Redo
      </button>

      {/* other toolbar items */}
    </div>
  );
}

export default Toolbar;
