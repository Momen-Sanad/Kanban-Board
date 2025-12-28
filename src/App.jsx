import { BoardProvider } from "./context/BoardProvider";
import Board from "./components/Board";

function App() {
  return (
    <BoardProvider>
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div style={{ width: "100%", maxWidth: 1800 }}>
          {/* Header */}
          <div className="board-header center-all">
            <h1 className="page-title">Kanban Board</h1>
          </div>

          <Board />
        </div>
      </div>
    </BoardProvider>
  );
}

export default App;
