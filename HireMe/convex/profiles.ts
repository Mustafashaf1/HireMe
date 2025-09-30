import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return null;

    let profilePhotoUrl = null;
    if (profile.profilePhoto) {
      profilePhotoUrl = await ctx.storage.getUrl(profile.profilePhoto);
    }

    return {
      ...profile,
      profilePhotoUrl,
    };
  },
});

export const getProfileByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) return null;

    let profilePhotoUrl = null;
    if (profile.profilePhoto) {
      profilePhotoUrl = await ctx.storage.getUrl(profile.profilePhoto);
    }

    return {
      ...profile,
      profilePhotoUrl,
    };
  },
});

export const createProfile = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    contactInfo: v.optional(v.string()),
    isProvider: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    return await ctx.db.insert("profiles", {
      userId,
      name: args.name,
      bio: args.bio,
      location: args.location,
      contactInfo: args.contactInfo,
      isProvider: args.isProvider,
    });
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    contactInfo: v.optional(v.string()),
    profilePhoto: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      name: args.name,
      bio: args.bio,
      location: args.location,
      contactInfo: args.contactInfo,
      profilePhoto: args.profilePhoto,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});
