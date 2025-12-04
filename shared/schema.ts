import { z } from "zod";

// RFP Line Item
export const rfpItemSchema = z.object({
  name: z.string(),
  qty: z.number(),
  specs: z.string(),
});

export type RfpItem = z.infer<typeof rfpItemSchema>;

// RFP Status
export type RfpStatus = "draft" | "sent" | "received" | "compared";

// RFP Schema
export const rfpSchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(rfpItemSchema),
  totalBudget: z.number().nullable(),
  currency: z.string().default("USD"),
  deliveryDays: z.number().nullable(),
  paymentTerms: z.string().nullable(),
  warranty: z.string().nullable(),
  notes: z.string().nullable(),
  mandatoryCriteria: z.array(z.string()),
  optionalCriteria: z.array(z.string()),
  status: z.enum(["draft", "sent", "received", "compared"]),
  sentVendorIds: z.array(z.string()),
  createdAt: z.string(),
});

export type Rfp = z.infer<typeof rfpSchema>;

export const insertRfpSchema = rfpSchema.omit({ id: true, createdAt: true, status: true, sentVendorIds: true });
export type InsertRfp = z.infer<typeof insertRfpSchema>;

// Natural Language Input
export const nlInputSchema = z.object({
  text: z.string().min(10, "Please provide more details about your requirements"),
});

export type NlInput = z.infer<typeof nlInputSchema>;

// Vendor Schema
export const vendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  contactPerson: z.string(),
  rating: z.number().min(1).max(5),
  capabilities: z.array(z.string()),
  tags: z.array(z.string()),
  lastContactedAt: z.string().nullable(),
});

export type Vendor = z.infer<typeof vendorSchema>;

export const insertVendorSchema = vendorSchema.omit({ id: true, lastContactedAt: true });
export type InsertVendor = z.infer<typeof insertVendorSchema>;

// Proposal Line Item
export const proposalLineItemSchema = z.object({
  itemName: z.string(),
  qty: z.number(),
  unitPrice: z.number(),
  totalPrice: z.number(),
  warranty: z.string().nullable(),
  deliveryDays: z.number().nullable(),
});

export type ProposalLineItem = z.infer<typeof proposalLineItemSchema>;

// Proposal Schema
export const proposalSchema = z.object({
  id: z.string(),
  rfpId: z.string(),
  vendorId: z.string(),
  vendorName: z.string(),
  lineItems: z.array(proposalLineItemSchema),
  totalPrice: z.number(),
  paymentTerms: z.string().nullable(),
  notes: z.string().nullable(),
  attachments: z.array(z.object({
    filename: z.string(),
    url: z.string(),
  })),
  receivedAt: z.string(),
});

export type Proposal = z.infer<typeof proposalSchema>;

export const insertProposalSchema = proposalSchema.omit({ id: true, receivedAt: true });
export type InsertProposal = z.infer<typeof insertProposalSchema>;

// AI Comparison Result
export const proposalScoreSchema = z.object({
  proposalId: z.string(),
  vendorName: z.string(),
  priceScore: z.number(),
  deliveryScore: z.number(),
  warrantyScore: z.number(),
  completenessScore: z.number(),
  vendorRatingScore: z.number(),
  totalScore: z.number(),
});

export type ProposalScore = z.infer<typeof proposalScoreSchema>;

export const comparisonResultSchema = z.object({
  scores: z.array(proposalScoreSchema),
  summary: z.string(),
  recommendedVendorId: z.string(),
  reason: z.string(),
});

export type ComparisonResult = z.infer<typeof comparisonResultSchema>;

// Dashboard Stats
export const dashboardStatsSchema = z.object({
  totalRfps: z.number(),
  activeRfps: z.number(),
  totalVendors: z.number(),
  proposalsReceived: z.number(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// Send RFP Request
export const sendRfpRequestSchema = z.object({
  vendorIds: z.array(z.string()).min(1, "Select at least one vendor"),
});

export type SendRfpRequest = z.infer<typeof sendRfpRequestSchema>;

// Email Webhook Payload
export const emailWebhookPayloadSchema = z.object({
  from: z.string(),
  subject: z.string(),
  text: z.string(),
  html: z.string().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string(),
  })).optional(),
});

export type EmailWebhookPayload = z.infer<typeof emailWebhookPayloadSchema>;
