"use client";

import { useEffect, useState } from "react";
import type { ProfileWithStats } from "@/lib/types";

export function useProfiles() {
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfiles() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/profiles?include=media_assets");
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Erreur lors de la récupération des profils");
        }
        const profilesArray = Array.isArray(json.data) ? json.data : json.profiles || [];
        setProfiles(profilesArray);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
        setProfiles([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfiles();
  }, []);

  return { profiles, isLoading, error };
}

export function useProfile(id: string) {
  const [profile, setProfile] = useState<ProfileWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadProfile() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/profiles/${id}?includeMedia=true&includeReviews=true&reviewLimit=10`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Profil introuvable");
        }
        setProfile(json.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [id]);

  return { profile, isLoading, error };
}

export function useProfilesByCategory(category: string) {
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) return;

    async function loadProfiles() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/profiles?category=${encodeURIComponent(category)}&include=media_assets`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Erreur lors de la récupération des profils");
        }
        const profilesArray = Array.isArray(json.data) ? json.data : json.profiles || [];
        setProfiles(profilesArray);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
        setProfiles([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfiles();
  }, [category]);

  return { profiles, isLoading, error };
}

export function useSearchProfiles(query: string) {
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setProfiles([]);
      return;
    }

    async function searchProfiles() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/profiles?search=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Erreur de recherche");
        }
        const profilesArray = Array.isArray(json.data) ? json.data : json.profiles || [];
        setProfiles(profilesArray);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
        setProfiles([]);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(searchProfiles, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return { profiles, isLoading, error };
}
