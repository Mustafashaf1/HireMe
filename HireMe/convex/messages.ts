import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMessages = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const booking = await ctx.db.get(args.bookingId);
    if (!booking || (booking.customerId !== userId && booking.providerId !== userId)) {
      throw new Error("Not authorized to view messages");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", message.senderId))
          .unique();

        return {
          ...message,
          senderName: sender?.name || "Unknown",
          isOwnMessage: message.senderId === userId,
        };
      })
    );
  },
});

export const sendMessage = mutation({
  args: {
    bookingId: v.id("bookings"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking || (booking.customerId !== userId && booking.providerId !== userId)) {
      throw new Error("Not authorized to send messages");
    }

    return await ctx.db.insert("messages", {
      bookingId: args.bookingId,
      senderId: userId,
      content: args.content,
    });
  },
});
