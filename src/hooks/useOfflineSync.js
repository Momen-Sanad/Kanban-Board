import { useEffect, useRef } from "react";
import { loadBoardFromIDB, saveBoardToIDB } from "../services/indexedDb";
import { loadBoardState } from "../services/storage";

export function useOfflineSync(state, dispatch) {
  const hydratedRef = useRef(false);

  //Hydrate on app start
  useEffect(() => {
    async function hydrate() {
      const idbState = await loadBoardFromIDB();

      if (idbState) {
        dispatch({ type: "HYDRATE", payload: idbState });
        hydratedRef.current = true;
        return;
      }

      const localState = loadBoardState();
      if (localState) {
        dispatch({ type: "HYDRATE", payload: localState });
        hydratedRef.current = true;
      }
    }

    hydrate();
  }, [dispatch]);

  //Persist on every state change
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveBoardToIDB(state);
  }, [state]);
}
