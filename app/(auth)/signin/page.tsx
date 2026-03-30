"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleCredentialsLogin = async (e: React.ChangeEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials");
      return;
    }

    router.push("/tryonpage"); // redirect after login
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-6">
      <h1 className="text-3xl font-bold text-center">Sign In</h1>

      <form onSubmit={handleCredentialsLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-black text-white py-3 rounded">
          Login
        </button>
      </form>

      {/* Google Login */}
      <button
        onClick={() => signIn("google")}
        className="w-full border py-3 rounded"
      >
        Continue with Google
      </button>

      {error && <p className="text-red-600 text-center">{error}</p>}
    </div>
  );
}
