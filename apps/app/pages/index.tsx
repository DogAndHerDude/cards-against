import { Form, Formik, useFormik } from "formik";
import { useRouter } from "next/router";
import * as Yup from "yup";
import { Button } from "../components/Button/Button";
import { Input } from "../components/Input/Input";
import { useAppDispatch } from "../store/hooks";
import { setUser } from "../store/slices/user.slice";
import { useCreateUser } from "./hooks/useCreateUser";

type FormValues = {
  name: string;
};

const initialValues: FormValues = { name: "" };

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, "Name should be 3 characters or more")
    .max(20, "Must be 20 characters or less")
    .required(),
});

export default function Home() {
  const dispatch = useAppDispatch();
  const createUser = useCreateUser();
  const router = useRouter();

  return (
    <main className="bg-zinc-900">
      <div className="container mx-auto flex flex-col items-center justify-center h-screen">
        <section className="-mt-20">
          <h1 className="text-5xl antialiased font-extrabold uppercase text-slate-50 my-6 text-center">
            Cards against
          </h1>
        </section>

        <section className="mt-2">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              try {
                const user = await createUser(values.name);

                dispatch(setUser(user));
                router.push("/rooms");
              } catch (error) {
                console.error(error);
              }
            }}
          >
            {() => (
              <Form>
                <Input
                  name="name"
                  type="text"
                  placeholder="Username"
                  className="text-center px-6 py-4"
                />
                <Button type="submit">Create user</Button>
              </Form>
            )}
          </Formik>
        </section>
      </div>
    </main>
  );
}
