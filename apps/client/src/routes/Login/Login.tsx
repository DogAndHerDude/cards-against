import { AxiosResponse } from "axios";
import { Component, JSX, onMount } from "solid-js";
import { http } from "../../utils/http";
import { User, authStore } from "../../store/auth.store";
import { useSockets } from "../../utils/SocketProvider";
import { useNavigate } from "@solidjs/router";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";

type LoginPayload = {
  name: string;
};

type LoginResponse = AxiosResponse<{
  token: string;
  user: User;
}>;

async function attemptLogin(name: string) {
  try {
    const response = await http.post<LoginPayload, LoginResponse>(
      "/auth/login",
      {
        name,
      },
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}

export const Login: Component = () => {
  const { auth, setToken } = authStore;
  const navigate = useNavigate();
  const { connect } = useSockets();
  const onSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (
    event,
  ) => {
    try {
      event.preventDefault();

      const data = new FormData(event.currentTarget);
      const { token, user } = await attemptLogin(data.get("name") as string);

      setToken(token, user);
      await connect(token);
      navigate("/rooms");
    } catch (error) {
      console.error(error);
    }
  };

  onMount(() => {
    if (auth.token) {
      navigate("/rooms");
    }
  });

  return (
    <div class="w-screen h-screen flex flex-col items-center bg-zinc-800">
      <h1 class="max-w-sm text-[5rem] font-bold uppercase text-slate-100 text-center leading-none mt-36">
        Cards Against
      </h1>

      <form class="mt-10 flex flex-col gap-6 items-center" onSubmit={onSubmit}>
        <Input
          required
          name="name"
          placeholder="Enter your username"
          type="text"
          maxlength={25}
          class="text-lg"
        />

        <Button invert type="submit">
          Start playing
        </Button>
      </form>
    </div>
  );
};
