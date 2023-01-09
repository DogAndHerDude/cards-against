import { useCallback } from "react";
import decode from "jwt-decode";

export const useCreateUser = () => {
  const createUser = useCallback(async (name: string) => {
    console.log("FUGG");
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    const data: { token: string } = await (await response).json();
    const tokenData: { id: string } = decode(data.token);

    return {
      id: tokenData.id,
      name,
      token: data.token,
    };
  }, []);

  return createUser;
};
