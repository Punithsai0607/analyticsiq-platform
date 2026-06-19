// Shared TypeScript types across the analytics platform

export type EventType = "page_view" | "click";

export interface TrackingEvent {
  _id?: string;
  sessionId: string;
  type: EventType;
  pageUrl: string;
  timestamp: string | Date;
  clickX?: number;
  clickY?: number;
  userAgent?: string;
  referrer?: string;
  viewportWidth?: number;
  viewportHeight?: number;
}

export interface SessionSummary {
  sessionId: string;
  eventCount: number;
  clickCount: number;
  pageViewCount: number;
  firstSeen: string;
  lastSeen: string;
  duration: number;
  pageCount: number;
  pages: string[];
  userAgent?: string;
}

export interface AnalyticsOverview {
  totalSessions: number;
  totalEvents: number;
  totalClicks: number;
  mostVisitedPage: string | null;
  activityTrend: TrendPoint[];
  topPages: TopPage[];
}

export interface TrendPoint {
  date: string;
  events: number;
  clicks: number;
  pageViews: number;
}

export interface TopPage {
  page: string;
  views: number;
}

export interface ClickPoint {
  x: number;
  y: number;
  timestamp?: string;
}

export interface HeatmapResponse {
  pageUrl: string;
  totalClicks: number;
  clicks: ClickPoint[];
  availablePages: string[];
}
