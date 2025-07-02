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
import { Button, TextField, Heading, SelectField } from "@aws-amplify/ui-react";
import { addToDynamoDB, getFromDynamoDB } from "@/api/dynamo";

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
      <div>
        <Heading level={3}>Confirm Sign Up</Heading>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <TextField
          label="Confirmation Code"
          name="code"
          onChange={onChange}
          value={formState.code || ""}
        />
        <Button onClick={handleConfirmSignUp}>Confirm</Button>
      </div>
    );
  }

  if (isSignUp) {
    return (
      <div>
        <Heading level={3}>Sign Up</Heading>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <TextField
          label="Email"
          name="email"
          type="email"
          onChange={onChange}
          value={formState.email}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          onChange={onChange}
          value={formState.password}
        />
        <SelectField
          label="User Type"
          name="userType"
          onChange={onChange}
          value={formState.userType || "user"}
        >
          <option value="user">User</option>
          <option value="owner">Owner</option>
        </SelectField>
        <Button onClick={handleSignUp}>Sign Up</Button>
        <p
          onClick={() => setIsSignUp(false)}
          style={{ cursor: "pointer", color: "blue" }}
        >
          Have an account? Sign In
        </p>
      </div>
    );
  }

  return (
    <div>
      <Heading level={3}>Sign In</Heading>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <TextField
        label="Email"
        name="email"
        type="email"
        onChange={onChange}
        value={formState.email}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        onChange={onChange}
        value={formState.password}
      />
      <Button onClick={handleSignIn}>Sign In</Button>
      <p
        onClick={() => setIsSignUp(true)}
        style={{ cursor: "pointer", color: "blue" }}
      >
        Don't have an account? Sign Up
      </p>
    </div>
  );
}
