"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.ChangeEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Signup failed");
      return;
    }

    router.push("/signin");
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-6">
      <h1 className="text-3xl font-bold text-center">Sign Up</h1>

      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          className="w-full border p-3 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          Create Account
        </button>
      </form>

      {error && <p className="text-red-600 text-center">{error}</p>}
    </div>
  );
}
