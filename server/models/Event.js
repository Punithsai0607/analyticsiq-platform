const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["page_view", "click"],
      required: true,
    },
    pageUrl: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
      default: Date.now,
    },
    clickX: {
      type: Number,
    },
    clickY: {
      type: Number,
    },
    userAgent: {
      type: String,
    },
    referrer: {
      type: String,
    },
    viewportWidth: {
      type: Number,
    },
    viewportHeight: {
      type: Number,
    },
  },
  {
    timestamps: false,
    collection: "events",
  }
);

// Compound indexes for common query patterns
EventSchema.index({ sessionId: 1, timestamp: 1 });
EventSchema.index({ pageUrl: 1, type: 1 });
EventSchema.index({ type: 1, timestamp: -1 });
EventSchema.index({ timestamp: -1 });

const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

module.exports = Event;
