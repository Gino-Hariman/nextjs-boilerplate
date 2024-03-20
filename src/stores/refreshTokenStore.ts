import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const $LOCAL_REFRESHTOKEN_KEY = 'rk_state';

type RefreshTokenStateType = {
  isRefreshingToken: boolean;
  setIsRefreshingToken: (isRefreshingToken: boolean) => void;
};

const useRefreshTokenStore = create<RefreshTokenStateType>()(
  persist(
    (set) => ({
      isRefreshingToken: false,
      setIsRefreshingToken: (isRefreshingToken: boolean) =>
        set({ isRefreshingToken }),
    }),
    {
      name: $LOCAL_REFRESHTOKEN_KEY,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useRefreshTokenStore;
