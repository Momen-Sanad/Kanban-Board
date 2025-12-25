import { BoardProvider } from "./context/BoardProvider";
import Board from "./components/Board";

function App() {
  return (
    <BoardProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center">
        <div className="board-header" style={{ width: "100%", maxWidth: 1200 }}>
          <h1 className="page-title">Kanban Board</h1>
        </div>

        <div className="w-full overflow-x-auto">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Board />
          </div>
        </div>
      </div>
    </BoardProvider>
  );
}


export default App;
