import { BoardProvider } from "./context/BoardProvider";
import Board from "./components/Board";

function App() {
  return (
    <BoardProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center">
        <h1 className="text-2xl font-bold my-4">Kanban Board</h1>

        <div className="w-full overflow-x-auto flex justify-center">
          <Board />
        </div>
      </div>
    </BoardProvider>
  );
}


export default App;
