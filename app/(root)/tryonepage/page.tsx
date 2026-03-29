"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TryOnRequest, tryOnRequestSchema } from "@/lib/validation/tryonSchema";
import React, { useEffect, useState } from "react";
import Image from "next/image";

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

      if (!res.ok) throw new Error("server error");

      const result = await res.json();

      if (!result.success) {
        setError(result.error || "something went wrong");
        return;
      }
      setResultImage(result.resultImage);
      setSuggestions(result.suggestions || "");
    } catch (error) {
      console.log(error);
      setError("failed to connect to the server ");
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
    <div className=" max-w-4xl mx-auto p-6 ">
      <h1 className="text-4xl font-bold text-center mb-10 ">virtual TryOn</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl ">
          <input
            type="checkbox"
            {...register("usePreviousUserPhoto")}
            className=" w-5 h-5"
          />
          <label className="text-lg">
            Use my previously uploaded body photo
          </label>
        </div>
        {/* userPhoto part  */}
        {!usePrevious && (
          <div>
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleUserPhotoChange}
            />

            {previewUser && (
              <Image
                src={previewUser}
                alt="viewing user"
                height={100}
                width={100}
                className="w-40 mt-2 rounded"
              />
            )}
            {errors.userPhoto && (
              <p className="text-red-700">{errors.userPhoto.message}</p>
            )}
          </div>
        )}

        {/* cloth photo */}

        <div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleClothPhotoChange}
          />
          {previewCloth && (
            <Image
              src={previewCloth}
              alt="viewing colth"
              height={100}
              width={100}
              className="w-40 mt-2 rounded"
            />
          )}

          {errors.clothPhoto && (
            <p className="text-red-600">{errors.clothPhoto.message}</p>
          )}
        </div>

        {/* submitting photo and user image */}
        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full bg-black text-white py-4 rounded-xl disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Generate Try-On"}
        </button>
      </form>
      {/* Error means if any error accures while doing this task*/}
      {error && <p className="text-red-700 mt-4">{error}</p>}
      {/* finally result  */}
      {resultImage && (
        <div className="mt-10">
          <Image
            src={resultImage}
            alt="showing final output"
            className="rounded-xl"
          />
          {suggestions && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p className="whitespace-pre-line">{suggestions}</p>
            </div>
          )}
          <button
            onClick={handleReset}
            className="mt-4 border px-4 py-2 rounded"
          >
            Try again!
          </button>
        </div>
      )}
    </div>
  );
}
