import type { Profile } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { base44Client } from "@/lib/clients/base44.client";
import type {
  Base44QueryParams,
  Base44User,
  CreateBase44UserDto,
  UpdateBase44UserDto,
} from "@/lib/types";

export class Base44UserService {
  static async listUsers(params: Base44QueryParams = {}): Promise<Base44User[]> {
    return base44Client.getUsers(params);
  }

  async listUsers(params: Base44QueryParams = {}): Promise<Base44User[]> {
    return Base44UserService.listUsers(params);
  }

  static async createUser(data: CreateBase44UserDto): Promise<Base44User> {
    return base44Client.createUser(data);
  }

  async createUser(data: CreateBase44UserDto): Promise<Base44User> {
    return Base44UserService.createUser(data);
  }

  static async getUser(userId: string): Promise<Base44User> {
    return base44Client.getUserById(userId);
  }

  async getUser(userId: string): Promise<Base44User> {
    return Base44UserService.getUser(userId);
  }

  static async updateUser(userId: string, data: UpdateBase44UserDto): Promise<Base44User> {
    return base44Client.updateUser(userId, data);
  }

  async updateUser(userId: string, data: UpdateBase44UserDto): Promise<Base44User> {
    return Base44UserService.updateUser(userId, data);
  }

  static async deleteUser(userId: string): Promise<{ success: boolean; id: string }> {
    return base44Client.deleteUser(userId);
  }

  async deleteUser(userId: string): Promise<{ success: boolean; id: string }> {
    return Base44UserService.deleteUser(userId);
  }

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
      base_rate: base44User.custom?.base_rate ? new Decimal(String(base44User.custom.base_rate)) : null,
      currency: base44User.custom?.currency || "EUR",
      instagram_url: base44User.custom?.instagram,
      tiktok_url: base44User.custom?.tiktok,
      twitter_url: base44User.custom?.twitter,
      website_url: base44User.custom?.website,
    };
  }
}

export const base44UserService = new Base44UserService();
