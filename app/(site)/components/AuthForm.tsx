"use client";

import { BsGithub, BsGoogle } from "react-icons/bs"; // Import social icons for GitHub and Google.
import axios from "axios"; // Import Axios for HTTP requests.
import { signIn, useSession } from "next-auth/react"; // NextAuth hooks for authentication.

import Button from "@/app/components/Button"; // Custom Button component.
import Input from "@/app/components/inputs/Input"; // Custom Input component.
import { useCallback, useEffect, useState } from "react"; // React hooks for state and side effects.
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"; // React Hook Form utilities.
import AuthSocialButton from "./AuthSocialButton"; // Component for rendering social OAuth buttons.
import toast from "react-hot-toast"; // For user notifications.
import { useRouter } from "next/navigation"; // Router for programmatic navigation.

type Variant = "LOGIN" | "REGISTER"; // Union type to define possible form modes.

export function AuthForm() {
  const session = useSession(); // Get the current authentication session.
  const router = useRouter(); // Router instance for navigation.
  const [variant, setVariant] = useState<Variant>("LOGIN"); // State for form mode (login or register).
  const [isLoading, setIsLoading] = useState(false); // State to track loading state.

  // Redirect authenticated users to the /users page.
  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/users");
    }
  }, [session?.status, router]);

  // Toggle between LOGIN and REGISTER modes.
  const toggleVariant = useCallback(() => {
    setVariant((prevVariant) => (prevVariant === "LOGIN" ? "REGISTER" : "LOGIN"));
  }, []);

  // React Hook Form setup with default values.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Form submission handler.
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true); // Set loading state.

    if (variant === "REGISTER") {
      // Registration flow: Send data to /api/register and then log in the user.
      axios
        .post("/api/register", data)
        .then(() => signIn("credentials", data))
        .catch(() => toast.error("Something went wrong"))
        .finally(() => setIsLoading(false));
    }

    if (variant === "LOGIN") {
      // Login flow: Authenticate with credentials.
      signIn("credentials", {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error("Invalid credentials");
          }
          if (callback?.ok && !callback.error) {
            toast.success("Logged in!");
            router.push("/users");
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  // Social login handler for GitHub and Google.
  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Invalid credentials");
        }
        if (callback?.ok && !callback.error) {
          toast.success("Logged in!");
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div
        className="
        bg-[#303030]
          px-4
          py-8
          shadow
          sm:rounded-lg
          sm:px-10
        "
      >
        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "REGISTER" && (
            <Input
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              id="name"
              label="Name"
            />
          )}
          <Input
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            id="email"
            label="Email address"
            type="email"
          />
          <Input
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            id="password"
            label="Password"
            type="password"
          />
          <div>
            <Button disabled={isLoading} fullWidth type="submit">
              {variant === "LOGIN" ? "Sign in" : "Register"}
            </Button>
          </div>
        </form>

        {/* Social Login */}
        <div className="mt-6">
          <div className="relative">
            <div
              className="
                absolute 
                inset-0 
                flex 
                items-center
              "
            >
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#303030] px-2 text-gray-300">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialAction("github")}
            />
            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialAction("google")}
            />
          </div>
        </div>

        {/* Toggle between Login and Register */}
        <div
          className="
            flex 
            gap-2 
            justify-center 
            text-sm 
            mt-6 
            px-2 
            text-gray-500
          "
        >
          <div className="text-gray-300">
            {variant === "LOGIN"
              ? "New to Messenger?"
              : "Already have an account?"}
          </div>
          <div
            className="text-gray-300 underline cursor-pointer"
            onClick={toggleVariant}
          >
            {variant === "LOGIN" ? "Create an account" : "Login"}
          </div>
        </div>
      </div>
    </div>
  );
}
