"use client";

import { useState } from "react";

export default function TryOnPage() {
  const [user, setUser] = useState<File | null>(null);
  const [cloth, setCloth] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !cloth) return;

    setLoading(true);

    const fd = new FormData();
    fd.append("userPhoto", user);
    fd.append("clothPhoto", cloth);

    const res = await fetch("/api/tryon", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();

    if (data.image) {
      setResult(`data:image/png;base64,${data.image}`);
    }

    setSuggestions(data.suggestions || "");
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Virtual Try-On</h1>

      <input type="file" onChange={(e) => setUser(e.target.files![0])} />
      <input type="file" onChange={(e) => setCloth(e.target.files![0])} />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Generating..." : "Try Outfit"}
      </button>

      {result && <img src={result} className="rounded-xl" />}

      {suggestions && (
        <div className="bg-gray-100 p-4 rounded">{suggestions}</div>
      )}
    </div>
  );
}