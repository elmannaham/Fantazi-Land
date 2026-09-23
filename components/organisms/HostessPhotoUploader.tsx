"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import { ImagePlus, Loader2, UserRound, X } from "lucide-react";
import { compressImage } from "@/lib/image-compress";

export const MAX_GALLERY_PHOTOS = 5;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");

interface HostessPhotoUploaderProps {
  avatar: File | null;
  photos: File[];
  onAvatarChange: (file: File | null) => void;
  onPhotosChange: (files: File[]) => void;
  disabled?: boolean;
}

/** Returns an error message for an unsupported or oversized file, otherwise null. */
function validatePhoto(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return `${file.name} : format non supporté (JPG, PNG ou WebP)`;
  if (file.size > MAX_PHOTO_BYTES) return `${file.name} : fichier trop lourd (10 Mo maximum)`;
  return null;
}

/** Object URLs for previews, revoked when the files change or the component unmounts. */
function usePreviewUrls(files: File[]): string[] {
  const urls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => urls.forEach((url) => URL.revokeObjectURL(url)), [urls]);
  return urls;
}

export function HostessPhotoUploader({
  avatar,
  photos,
  onAvatarChange,
  onPhotosChange,
  disabled = false,
}: HostessPhotoUploaderProps) {
  const avatarInputId = useId();
  const photosInputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const avatarFiles = useMemo(() => (avatar ? [avatar] : []), [avatar]);
  const [avatarPreview] = usePreviewUrls(avatarFiles);
  const photoPreviews = usePreviewUrls(photos);
  const remaining = MAX_GALLERY_PHOTOS - photos.length;

  const handleAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;
    const problem = validatePhoto(file);
    setError(problem);
    if (problem) return;
    setIsProcessing(true);
    onAvatarChange(await compressImage(file));
    setIsProcessing(false);
  };

  const handlePhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    const problems = selected.map(validatePhoto).filter((p): p is string => p !== null);
    const valid = selected.filter((file) => validatePhoto(file) === null);
    const accepted = valid.slice(0, remaining);

    if (valid.length > remaining) {
      problems.push(`${MAX_GALLERY_PHOTOS} photos maximum : ${valid.length - remaining} photo(s) ignorée(s)`);
    }
    setError(problems.length > 0 ? problems.join(" · ") : null);
    if (accepted.length === 0) return;
    // Redimensionnées dans le navigateur pour rester sous la limite d'envoi (4,5 Mo sur Vercel)
    setIsProcessing(true);
    const compressed = await Promise.all(accepted.map(compressImage));
    onPhotosChange([...photos, ...compressed]);
    setIsProcessing(false);
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
    setError(null);
  };

  return (
    <fieldset className="space-y-5" disabled={disabled || isProcessing} aria-busy={isProcessing}>
      <legend className="block text-sm font-medium text-gray-700">Photos du profil</legend>

      {/* Photo de profil (obligatoire) */}
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimisable
            <img src={avatarPreview} alt="Aperçu de la photo de profil" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <UserRound className="h-10 w-10" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor={avatarInputId}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-purple-600 px-3.5 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-50 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-purple-600"
          >
            {avatar ? "Changer la photo de profil" : "Choisir la photo de profil *"}
            <input
              id={avatarInputId}
              type="file"
              accept={ACCEPT_ATTR}
              onChange={handleAvatar}
              className="sr-only"
            />
          </label>
          <p className="text-xs text-gray-500">JPG, PNG ou WebP · 10 Mo maximum</p>
        </div>
      </div>

      {/* Galerie : jusqu'à 5 photos */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-700">
            Galerie <span className="text-gray-500">({photos.length}/{MAX_GALLERY_PHOTOS})</span>
          </span>
        </div>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {photos.map((file, i) => (
            <li key={`${file.name}-${file.lastModified}-${i}`} className="relative aspect-[3/4]">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              <img
                src={photoPreviews[i]}
                alt={`Photo ${i + 1} de la galerie`}
                className="h-full w-full rounded-xl border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label={`Retirer la photo ${i + 1}`}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
          {remaining > 0 && (
            <li className="aspect-[3/4]">
              <label
                htmlFor={photosInputId}
                className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 transition hover:border-purple-500 hover:text-purple-600 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-purple-600"
              >
                <ImagePlus className="h-6 w-6" aria-hidden="true" />
                <span className="text-xs font-medium">Ajouter</span>
                <span className="sr-only">des photos à la galerie ({remaining} restante(s))</span>
                <input
                  id={photosInputId}
                  type="file"
                  accept={ACCEPT_ATTR}
                  multiple
                  onChange={handlePhotos}
                  className="sr-only"
                />
              </label>
            </li>
          )}
        </ul>
      </div>

      {isProcessing && (
        <p className="flex items-center gap-2 text-xs text-gray-500" role="status">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          Préparation des photos…
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}
