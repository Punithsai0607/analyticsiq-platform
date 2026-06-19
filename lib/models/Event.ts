import mongoose, { Document, Schema } from "mongoose";

export type EventType = "page_view" | "click";

export interface IEvent extends Document {
  sessionId: string;
  type: EventType;
  pageUrl: string;
  timestamp: Date;
  clickX?: number;
  clickY?: number;
  userAgent?: string;
  referrer?: string;
  viewportWidth?: number;
  viewportHeight?: number;
}

const EventSchema = new Schema<IEvent>(
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

const Event = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
