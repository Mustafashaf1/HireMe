import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    contactInfo: v.optional(v.string()),
    profilePhoto: v.optional(v.id("_storage")),
    isProvider: v.boolean(),
  }).index("by_user", ["userId"]),

  services: defineTable({
    providerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    location: v.string(),
    availability: v.optional(v.string()),
    photos: v.array(v.id("_storage")),
    isActive: v.boolean(),
  }).index("by_provider", ["providerId"])
    .index("by_category", ["category"])
    .index("by_location", ["location"])
    .index("by_active", ["isActive"]),

  bookings: defineTable({
    serviceId: v.id("services"),
    customerId: v.id("users"),
    providerId: v.id("users"),
    requestedDate: v.string(),
    requestedTime: v.string(),
    message: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
  }).index("by_customer", ["customerId"])
    .index("by_provider", ["providerId"])
    .index("by_service", ["serviceId"])
    .index("by_status", ["status"]),

  messages: defineTable({
    bookingId: v.id("bookings"),
    senderId: v.id("users"),
    content: v.string(),
  }).index("by_booking", ["bookingId"])
    .index("by_sender", ["senderId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
