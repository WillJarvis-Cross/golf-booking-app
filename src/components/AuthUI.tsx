"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { signIn, signOut, signUp, confirmSignUp } from "aws-amplify/auth";
import { useAuth } from "../app/context/AuthContext";
import { useRouter } from "next/navigation";
import { addToDynamoDB, getFromDynamoDB } from "@/api/dynamo";
import Container from "@/ui-components/Container";
import TextField from "@/ui-components/TextField";
import Button from "@/ui-components/Button";

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
    const fetchUserInfo = async () => {
      if (user) {
        try {
          const userInfo = (await getFromDynamoDB("user-info", user.email)) as {
            userType: string;
          };
          setUser(userInfo);

          if (userInfo.userType === "owner") {
            router.push("/dashboard-owner");
          } else {
            router.push("/dashboard-user");
          }
        } catch (err) {
          console.error("Error fetching user info:", err);
          setError("Failed to fetch user information.");
        }
      }
    };

    fetchUserInfo();
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
      setError("An unknown error occurred.");
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
        {error && <p className="alert alert-danger mb-4">{error}</p>}
        <TextField
          label="Confirmation Code"
          name="code"
          value={formState.code || ""}
          onChange={onChange}
          placeholder="Enter your confirmation code"
        />
        <Button onClick={handleConfirmSignUp} label="Confirm" />
      </Container>
    );
  }

  if (isSignUp) {
    return (
      <Container title="Sign Up">
        {error && <p className="alert alert-danger mb-4">{error}</p>}
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
        <div className="mb-3">
          <label htmlFor="userType" className="form-label">
            User Type
          </label>
          <select
            name="userType"
            id="userType"
            onChange={onChange}
            value={formState.userType || "user"}
            className="form-select"
          >
            <option value="user">User</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <Button onClick={handleSignUp} label="Sign Up" />
        <p
          onClick={() => setIsSignUp(false)}
          className="text-primary mt-3 text-center"
          style={{ cursor: "pointer" }}
        >
          Have an account? Sign In
        </p>
      </Container>
    );
  }

  return (
    <Container title="Sign In">
      {error && <p className="alert alert-danger mb-4">{error}</p>}
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
      <Button onClick={handleSignIn} label="Sign In" />
      <p
        onClick={() => setIsSignUp(true)}
        className="text-primary mt-3 text-center"
        style={{ cursor: "pointer" }}
      >
        Don't have an account? Sign Up
      </p>
    </Container>
  );
}
