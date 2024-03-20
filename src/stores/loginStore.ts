import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const $LOCAL_LOGGEDIN_KEY = 'loged_in_state';

type LoginStateType = {
  isAlreadyLogin: boolean;
  setIsAlreadyLogin: (isAlreadyLogin: boolean) => void;
};

const useLoginStore = create<LoginStateType>()(
  persist(
    (set) => ({
      isAlreadyLogin: false,
      setIsAlreadyLogin: (isAlreadyLogin: boolean) => set({ isAlreadyLogin }),
    }),
    {
      name: $LOCAL_LOGGEDIN_KEY,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useLoginStore;
