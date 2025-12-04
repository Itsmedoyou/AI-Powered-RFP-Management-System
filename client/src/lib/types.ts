import type {
  Rfp,
  RfpItem,
  InsertRfp,
  NlInput,
  Vendor,
  InsertVendor,
  Proposal,
  ProposalLineItem,
  InsertProposal,
  ProposalScore,
  ComparisonResult,
  DashboardStats,
  SendRfpRequest,
} from "@shared/schema";

// Re-export all types
export type {
  Rfp,
  RfpItem,
  InsertRfp,
  NlInput,
  Vendor,
  InsertVendor,
  Proposal,
  ProposalLineItem,
  InsertProposal,
  ProposalScore,
  ComparisonResult,
  DashboardStats,
  SendRfpRequest,
};

// RFP Status type
export type RfpStatus = "draft" | "sent" | "received" | "compared";

// Frontend-specific types
export interface ApiError {
  message: string;
  status?: number;
}

export interface ParsedRfpResponse {
  rfp: InsertRfp;
  raw: string;
}

export interface RfpWithVendors {
  rfp: Rfp;
  vendors: Vendor[];
  proposals: Proposal[];
}
