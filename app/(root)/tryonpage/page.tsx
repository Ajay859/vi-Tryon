"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TryOnRequest, tryOnRequestSchema } from "@/lib/validation/tryonSchema";
import React, { useEffect, useState } from "react";

export default function TryOnPage() {
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState("");
  const [error, setError] = useState("");
  const [previewUser, setPreviewUser] = useState<string | null>(null);
  const [previewCloth, setPreviewCloth] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<TryOnRequest>({
    resolver: zodResolver(tryOnRequestSchema),
    mode: "onChange",
    defaultValues: {
      usePreviousUserPhoto: false,
    },
  });

  const usePrevious = watch("usePreviousUserPhoto");

  useEffect(() => {
    if (usePrevious) {
      setPreviewUser(null);
    }
  }, [usePrevious]);

  const onSubmit = async (data: TryOnRequest) => {
    setLoading(true);
    setError("");
    setResultImage(null);
    setSuggestions("");

    const formData = new FormData();

    formData.append("usePreviousUserPhoto", String(data.usePreviousUserPhoto));

    if (!data.usePreviousUserPhoto && data.userPhoto) {
      formData.append("userPhoto", data.userPhoto);
    }

    formData.append("clothPhoto", data.clothPhoto);

    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.error || "Something went wrong");
        return;
      }

      setResultImage(result.resultImage || null);
      setSuggestions(result.suggestions || "");
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleUserPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue("userPhoto", file, { shouldValidate: true });
    setPreviewUser(URL.createObjectURL(file));
  };

  const handleClothPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue("clothPhoto", file, { shouldValidate: true });
    setPreviewCloth(URL.createObjectURL(file));
  };

  const handleReset = () => {
    reset();
    setResultImage(null);
    setSuggestions("");
    setError("");
    setPreviewUser(null);
    setPreviewCloth(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-10">
        Virtual Try-On ✨
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Toggle */}
        <div className="flex items-center gap-3 bg-gray-100 p-4 rounded-xl">
          <input type="checkbox" {...register("usePreviousUserPhoto")} />
          <label>Use my previous body photo</label>
        </div>

        {/* User Photo */}
        {!usePrevious && (
          <div>
            <input type="file" onChange={handleUserPhotoChange} />
            {previewUser && (
              <img src={previewUser} className="w-40 mt-3 rounded-xl shadow" />
            )}
            {errors.userPhoto && (
              <p className="text-red-600">{errors.userPhoto.message}</p>
            )}
          </div>
        )}

        {/* Cloth */}
        <div>
          <input type="file" onChange={handleClothPhotoChange} />
          {previewCloth && (
            <img src={previewCloth} className="w-40 mt-3 rounded-xl shadow" />
          )}
          {errors.clothPhoto && (
            <p className="text-red-600">{errors.clothPhoto.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          disabled={loading || !isValid}
          className="w-full bg-black text-white py-4 rounded-xl disabled:bg-gray-400"
        >
          {loading ? "AI is working..." : "Generate Try-On"}
        </button>
      </form>

      {/* Error */}
      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

      {/* RESULT SECTION */}
      {(resultImage || suggestions) && (
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-semibold">Your Result</h2>

          {/* Image */}
          {resultImage ? (
            <img
              src={resultImage}
              className="rounded-xl shadow-xl max-w-full"
            />
          ) : (
            <p className="text-yellow-600">
              ⚠️ Image not generated, but here are suggestions
            </p>
          )}

          {/* Suggestions */}
          {suggestions && (
            <div className="bg-gray-100 p-5 rounded-xl whitespace-pre-line">
              {suggestions}
            </div>
          )}

          <button
            onClick={handleReset}
            className="border px-6 py-2 rounded-xl hover:bg-gray-100"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
