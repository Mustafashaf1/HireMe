import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createBooking = mutation({
  args: {
    serviceId: v.id("services"),
    requestedDate: v.string(),
    requestedTime: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    if (service.providerId === userId) {
      throw new Error("Cannot book your own service");
    }

    return await ctx.db.insert("bookings", {
      serviceId: args.serviceId,
      customerId: userId,
      providerId: service.providerId,
      requestedDate: args.requestedDate,
      requestedTime: args.requestedTime,
      message: args.message,
      status: "pending",
    });
  },
});

export const getMyBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const customerBookings = await ctx.db
      .query("bookings")
      .withIndex("by_customer", (q) => q.eq("customerId", userId))
      .collect();

    const providerBookings = await ctx.db
      .query("bookings")
      .withIndex("by_provider", (q) => q.eq("providerId", userId))
      .collect();

    const allBookings = [...customerBookings, ...providerBookings];

    return await Promise.all(
      allBookings.map(async (booking) => {
        const service = await ctx.db.get(booking.serviceId);
        const customer = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", booking.customerId))
          .unique();
        const provider = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", booking.providerId))
          .unique();

        return {
          ...booking,
          service,
          customer,
          provider,
          isCustomer: booking.customerId === userId,
          isProvider: booking.providerId === userId,
        };
      })
    );
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(v.literal("accepted"), v.literal("declined")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking || booking.providerId !== userId) {
      throw new Error("Booking not found or not authorized");
    }

    await ctx.db.patch(args.bookingId, {
      status: args.status,
    });
  },
});
