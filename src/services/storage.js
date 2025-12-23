export const loadBoardState = () => {
  const savedState = localStorage.getItem("kanban-board-state");
  return savedState ? JSON.parse(savedState) : null;
};

export const saveBoardState = (state) => {
  localStorage.setItem("kanban-board-state", JSON.stringify(state));
};