"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TryOnRequest, tryOnRequestSchema } from "@/lib/validation/tryonSchema";
import React, { useEffect, useState } from "react";

type TryOnCategory = "tops" | "bottoms" | "one-pieces";

export default function TryOnPage() {
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState("");
  const [error, setError] = useState("");
  const [previewUser, setPreviewUser] = useState<string | null>(null);
  const [previewCloth, setPreviewCloth] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState<TryOnCategory>("tops");
  const [garmentPhotoType, setGarmentPhotoType] = useState("auto");
  const [segmentationFree, setSegmentationFree] = useState(true);

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
      if (previewUser) URL.revokeObjectURL(previewUser);
      setPreviewUser(null);
    }
  }, [usePrevious, previewUser]);

  const onSubmit = async (data: TryOnRequest) => {
    setLoading(true);
    setError("");
    setResultImage(null);
    setSuggestions("");

    const formData = new FormData();
    formData.append("usePreviousUserPhoto", String(data.usePreviousUserPhoto));
    formData.append("category", category);
    formData.append("garmentPhotoType", garmentPhotoType);
    formData.append("segmentationFree", String(segmentationFree));

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

      setResultImage(result.image || null);
      setSuggestions(result.suggestions || "");
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleUserPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue("userPhoto", file, { shouldValidate: true });

    if (previewUser) URL.revokeObjectURL(previewUser);
    setPreviewUser(URL.createObjectURL(file));
  };

  const handleClothPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue("clothPhoto", file, { shouldValidate: true });

    if (previewCloth) URL.revokeObjectURL(previewCloth);
    setPreviewCloth(URL.createObjectURL(file));
  };

  const handleReset = () => {
    if (previewUser) URL.revokeObjectURL(previewUser);
    if (previewCloth) URL.revokeObjectURL(previewCloth);

    reset();
    setResultImage(null);
    setSuggestions("");
    setError("");
    setPreviewUser(null);
    setPreviewCloth(null);
    setCategory("tops");
    setGarmentPhotoType("auto");
    setSegmentationFree(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-10">
        Virtual Try-On ✨
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-3 bg-gray-100 p-4 rounded-xl">
          <input type="checkbox" {...register("usePreviousUserPhoto")} />
          <label>Use my previous body photo</label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TryOnCategory)}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="tops">Top / Upper body</option>
            <option value="bottoms">Bottom / Lower body</option>
            <option value="one-pieces">One piece / Dress</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Garment photo type
          </label>
          <select
            value={garmentPhotoType}
            onChange={(e) => setGarmentPhotoType(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="auto">Auto</option>
            <option value="model">Model photo</option>
            <option value="flat-lay">Flat lay</option>
            <option value="hanger">Hanger</option>
          </select>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
          <input
            id="segmentationFree"
            type="checkbox"
            checked={segmentationFree}
            onChange={(e) => setSegmentationFree(e.target.checked)}
          />
          <label htmlFor="segmentationFree">
            Use segmentation-free mode
          </label>
        </div>

        {!usePrevious && (
          <div>
            <label className="block text-sm font-medium mb-1">Your Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUserPhotoChange}
            />
            {previewUser && (
              <img
                src={previewUser}
                alt="User preview"
                className="w-40 mt-3 rounded-xl shadow"
              />
            )}
            {errors.userPhoto && (
              <p className="text-red-600 text-sm mt-1">
                {errors.userPhoto.message as string}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Cloth Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleClothPhotoChange}
          />
          {previewCloth && (
            <img
              src={previewCloth}
              alt="Cloth preview"
              className="w-40 mt-3 rounded-xl shadow"
            />
          )}
          {errors.clothPhoto && (
            <p className="text-red-600 text-sm mt-1">
              {errors.clothPhoto.message as string}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full bg-black text-white py-4 rounded-xl disabled:bg-gray-400 transition-colors"
        >
          {loading ? "Generating... please wait ⏳" : "Generate Try-On"}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

      {(resultImage || suggestions) && (
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-semibold">Your Result</h2>

          {resultImage ? (
            <img
              src={resultImage}
              alt="Virtual try-on result"
              className="rounded-xl shadow-xl max-w-full"
            />
          ) : (
            <p className="text-yellow-600">
              ⚠️ Image not generated, but here are suggestions
            </p>
          )}

          {suggestions && (
            <div className="bg-gray-100 p-5 rounded-xl whitespace-pre-line">
              {suggestions}
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="border px-6 py-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}