"use client";

import { useState, useEffect, ChangeEvent } from "react";
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  fetchUserAttributes,
} from "aws-amplify/auth";
import { useAuth } from "../app/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button, Heading, SelectField } from "@aws-amplify/ui-react";
import { addToDynamoDB, getFromDynamoDB } from "@/api/dynamo";
import Container from "@/ui-components/Container";
import TextField from "@/ui-components/TextField";

interface FormState {
  email: string;
  password: string;
  userType: "user" | "owner" | "";
  code?: string;
}

export default function AuthUI() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
    userType: "",
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (user) {
      const userType = user.attributes?.["custom:userType"];
      if (userType === "owner") {
        router.push("/dashboard-owner");
      } else {
        router.push("/dashboard-user");
      }
    }
  }, [user, router]);

  async function handleSignIn() {
    try {
      await signIn({ username: formState.email, password: formState.password });

      const userInfo = (await getFromDynamoDB(
        "user-info",
        formState.email
      )) as { userType: string };
      setUser(userInfo);

      if (userInfo.userType === "owner") {
        router.push("/dashboard-owner");
      } else {
        router.push("/dashboard-user");
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  }

  async function handleSignUp() {
    try {
      await signUp({
        username: formState.email,
        password: formState.password,
        options: {
          userAttributes: {
            email: formState.email,
            ["custom:userType"]: formState.userType,
          } as Record<string, string>,
        },
      });

      await addToDynamoDB("user-info", {
        email: formState.email,
        userType: formState.userType,
      });

      setIsSignUp(false);
      setIsConfirming(true);
      setError("Check your email for the verification code.");
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleConfirmSignUp() {
    try {
      await confirmSignUp({
        username: formState.email,
        confirmationCode: formState.code || "",
      });
      setIsConfirming(false);
      setError("Account confirmed! You can now sign in.");
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (isConfirming) {
    return (
      <Container title="Confirm Sign Up">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <TextField
          label="Confirmation Code"
          name="code"
          value={formState.code || ""}
          onChange={onChange}
          placeholder="Enter your confirmation code"
        />
        <button
          onClick={handleConfirmSignUp}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Confirm
        </button>
      </Container>
    );
  }

  if (isSignUp) {
    return (
      <Container title="Sign Up">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <TextField
          label="Email"
          name="email"
          value={formState.email}
          onChange={onChange}
          placeholder="Enter your email"
          type="email"
        />
        <TextField
          label="Password"
          name="password"
          value={formState.password}
          onChange={onChange}
          placeholder="Enter your password"
          type="password"
        />
        <div className="mb-4">
          <label
            htmlFor="userType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            User Type
          </label>
          <select
            name="userType"
            id="userType"
            onChange={onChange}
            value={formState.userType || "user"}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="user">User</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <button
          onClick={handleSignUp}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Sign Up
        </button>
        <p
          onClick={() => setIsSignUp(false)}
          className="text-blue-500 mt-4 cursor-pointer"
        >
          Have an account? Sign In
        </p>
      </Container>
    );
  }

  return (
    <Container title="Sign In">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <TextField
        label="Email"
        name="email"
        value={formState.email}
        onChange={onChange}
        placeholder="Enter your email"
        type="email"
      />
      <TextField
        label="Password"
        name="password"
        value={formState.password}
        onChange={onChange}
        placeholder="Enter your password"
        type="password"
      />
      <button
        onClick={handleSignIn}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Sign In
      </button>
      <p
        onClick={() => setIsSignUp(true)}
        className="text-blue-500 mt-4 cursor-pointer"
      >
        Don't have an account? Sign Up
      </p>
    </Container>
  );
}
