import type { Profile } from "@prisma/client";
import type { CreateBase44UserDto, UpdateBase44UserDto } from "@/lib/types";

export class Base44UserService {
  /**
   * Convertir Profile Fantazi-Land → Base44 User (création)
   */
  static mapProfileToBase44User(
    profile: Profile,
    email: string
  ): CreateBase44UserDto {
    return {
      email,
      full_name: profile.name,
      role: "user",
      category: profile.category,
      description: profile.bio,
      avatar_url: profile.avatar_url,
      base_rate: profile.base_rate?.toNumber(),
      currency: profile.currency,
      instagram: profile.instagram_url,
      tiktok: profile.tiktok_url,
      twitter: profile.twitter_url,
      website: profile.website_url,
    } as any;
  }

  /**
   * Convertir Profile Fantazi-Land → Base44 User (mise à jour)
   */
  static mapProfileToBase44UserUpdate(
    profile: Profile
  ): UpdateBase44UserDto {
    return {
      full_name: profile.name,
      category: profile.category,
      description: profile.bio,
      avatar_url: profile.avatar_url,
      base_rate: profile.base_rate?.toNumber(),
      currency: profile.currency,
      instagram: profile.instagram_url,
      tiktok: profile.tiktok_url,
      twitter: profile.twitter_url,
      website: profile.website_url,
    } as any;
  }

  /**
   * Convertir Base44 User → Profile Fantazi-Land (sync reverse)
   */
  static mapBase44UserToProfile(base44User: any): Partial<Profile> {
    return {
      name: base44User.full_name,
      category: base44User.custom?.category as any,
      bio: base44User.custom?.description,
      avatar_url: base44User.custom?.avatar_url,
      base_rate: base44User.custom?.base_rate ? parseFloat(base44User.custom.base_rate) : null,
      currency: base44User.custom?.currency || "EUR",
      instagram_url: base44User.custom?.instagram,
      tiktok_url: base44User.custom?.tiktok,
      twitter_url: base44User.custom?.twitter,
      website_url: base44User.custom?.website,
    };
  }
}
