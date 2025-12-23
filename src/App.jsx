import { BoardProvider } from "./context/BoardProvider";
import Board from "./components/Board";

function App() {
  return (
    <BoardProvider>
      <div className="min-h-screen bg-gray-100">
          <Board />
        <h1 className="text-2xl font-bold p-4">
          Kanban Board
        </h1>
      </div>
    </BoardProvider>
  );
}

export default App;
