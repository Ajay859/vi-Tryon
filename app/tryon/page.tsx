"use client";
import { useState } from "react";

export default function TryOnPage() {
  const [userFile, setUserFile] = useState<File | null>(null);
  const [clothFile, setClothFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFile || !clothFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("userPhoto", userFile);
    formData.append("clothPhoto", clothFile);

    const res = await fetch("/api/try-on", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) setResult(data.resultImage);
    setLoading(false);
  };

  return (
   <div>
    
   </div>
  );
}