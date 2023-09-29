import { createRoot } from "solid-js";
import { createStore, produce } from "solid-js/store";

export type User = {
  id: string;
  name: string;
};

export type AuthStore = {
  token?: string;
  user?: User;
};

function createAuthStore() {
  const [auth, setAuthStore] = createStore<AuthStore>({});
  const setToken = (token: string, user: User) => {
    setAuthStore(
      produce((store) => {
        store.token = token;
        store.user = user;
      }),
    );
  };
  const resetAuthStore = () => {
    setAuthStore({});
  };

  return { auth, setToken, resetAuthStore };
}

export const authStore = createRoot(createAuthStore);
