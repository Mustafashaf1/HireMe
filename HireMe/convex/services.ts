import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listServices = query({
  args: {
    category: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let servicesQuery = ctx.db
      .query("services")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    if (args.category) {
      servicesQuery = ctx.db
        .query("services")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .filter((q) => q.eq(q.field("isActive"), true));
    }

    if (args.location) {
      servicesQuery = ctx.db
        .query("services")
        .withIndex("by_location", (q) => q.eq("location", args.location!))
        .filter((q) => q.eq(q.field("isActive"), true));
    }

    const services = await servicesQuery.collect();

    return await Promise.all(
      services.map(async (service) => {
        const provider = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", service.providerId))
          .unique();

        const photoUrls = await Promise.all(
          service.photos.map(async (photoId) => {
            return await ctx.storage.getUrl(photoId);
          })
        );

        return {
          ...service,
          providerName: provider?.name || "Unknown Provider",
          photoUrls: photoUrls.filter(Boolean),
        };
      })
    );
  },
});

export const getService = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) return null;

    const provider = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", service.providerId))
      .unique();

    const photoUrls = await Promise.all(
      service.photos.map(async (photoId) => {
        return await ctx.storage.getUrl(photoId);
      })
    );

    let providerPhotoUrl = null;
    if (provider?.profilePhoto) {
      providerPhotoUrl = await ctx.storage.getUrl(provider.profilePhoto);
    }

    return {
      ...service,
      provider: provider ? {
        ...provider,
        profilePhotoUrl: providerPhotoUrl,
      } : null,
      photoUrls: photoUrls.filter(Boolean),
    };
  },
});

export const getMyServices = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const services = await ctx.db
      .query("services")
      .withIndex("by_provider", (q) => q.eq("providerId", userId))
      .collect();

    return await Promise.all(
      services.map(async (service) => {
        const photoUrls = await Promise.all(
          service.photos.map(async (photoId) => {
            return await ctx.storage.getUrl(photoId);
          })
        );

        return {
          ...service,
          photoUrls: photoUrls.filter(Boolean),
        };
      })
    );
  },
});

export const createService = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    location: v.string(),
    availability: v.optional(v.string()),
    photos: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile?.isProvider) {
      throw new Error("Only providers can create services");
    }

    return await ctx.db.insert("services", {
      providerId: userId,
      title: args.title,
      description: args.description,
      category: args.category,
      price: args.price,
      location: args.location,
      availability: args.availability,
      photos: args.photos,
      isActive: true,
    });
  },
});

export const updateService = mutation({
  args: {
    serviceId: v.id("services"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    location: v.string(),
    availability: v.optional(v.string()),
    photos: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const service = await ctx.db.get(args.serviceId);
    if (!service || service.providerId !== userId) {
      throw new Error("Service not found or not authorized");
    }

    await ctx.db.patch(args.serviceId, {
      title: args.title,
      description: args.description,
      category: args.category,
      price: args.price,
      location: args.location,
      availability: args.availability,
      photos: args.photos,
    });
  },
});

export const deleteService = mutation({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const service = await ctx.db.get(args.serviceId);
    if (!service || service.providerId !== userId) {
      throw new Error("Service not found or not authorized");
    }

    await ctx.db.patch(args.serviceId, { isActive: false });
  },
});
