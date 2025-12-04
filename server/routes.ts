import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extractRfpFromNL, parseVendorReply, compareProposals } from "./aiService";
import { sendRfpEmail } from "./emailService";
import {
  nlInputSchema,
  insertRfpSchema,
  insertVendorSchema,
  sendRfpRequestSchema,
  emailWebhookPayloadSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });

  // RFPs
  app.get("/api/rfps", async (req, res) => {
    try {
      const rfps = await storage.getRfps();
      res.json(rfps);
    } catch (error) {
      console.error("Error getting RFPs:", error);
      res.status(500).json({ message: "Failed to get RFPs" });
    }
  });

  app.get("/api/rfps/recent", async (req, res) => {
    try {
      const rfps = await storage.getRfps();
      res.json(rfps.slice(0, 6));
    } catch (error) {
      console.error("Error getting recent RFPs:", error);
      res.status(500).json({ message: "Failed to get recent RFPs" });
    }
  });

  app.get("/api/rfps/:id", async (req, res) => {
    try {
      const rfp = await storage.getRfp(req.params.id);
      if (!rfp) {
        return res.status(404).json({ message: "RFP not found" });
      }
      res.json(rfp);
    } catch (error) {
      console.error("Error getting RFP:", error);
      res.status(500).json({ message: "Failed to get RFP" });
    }
  });

  // Create RFP from Natural Language
  app.post("/api/rfps/from-nl", async (req, res) => {
    try {
      const parsed = nlInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const rfp = await extractRfpFromNL(parsed.data.text);
      res.json({ rfp });
    } catch (error) {
      console.error("Error extracting RFP from NL:", error);
      res.status(500).json({ message: "Failed to extract RFP from natural language" });
    }
  });

  // Create RFP
  app.post("/api/rfps", async (req, res) => {
    try {
      const parsed = insertRfpSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const rfp = await storage.createRfp(parsed.data);
      res.status(201).json(rfp);
    } catch (error) {
      console.error("Error creating RFP:", error);
      res.status(500).json({ message: "Failed to create RFP" });
    }
  });

  // Update RFP
  app.patch("/api/rfps/:id", async (req, res) => {
    try {
      const rfp = await storage.updateRfp(req.params.id, req.body);
      if (!rfp) {
        return res.status(404).json({ message: "RFP not found" });
      }
      res.json(rfp);
    } catch (error) {
      console.error("Error updating RFP:", error);
      res.status(500).json({ message: "Failed to update RFP" });
    }
  });

  // Delete RFP
  app.delete("/api/rfps/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRfp(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "RFP not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting RFP:", error);
      res.status(500).json({ message: "Failed to delete RFP" });
    }
  });

  // Send RFP to Vendors
  app.post("/api/rfps/:id/send", async (req, res) => {
    try {
      const parsed = sendRfpRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const rfp = await storage.getRfp(req.params.id);
      if (!rfp) {
        return res.status(404).json({ message: "RFP not found" });
      }

      const { vendorIds } = parsed.data;
      const vendors = await Promise.all(vendorIds.map((id) => storage.getVendor(id)));
      const validVendors = vendors.filter((v) => v !== undefined);

      if (validVendors.length === 0) {
        return res.status(400).json({ message: "No valid vendors found" });
      }

      // Send emails to all vendors
      const results = await Promise.all(
        validVendors.map((vendor) => sendRfpEmail(vendor!, rfp))
      );

      // Update RFP with sent vendor IDs and status
      const allSentVendorIds = Array.from(new Set([...rfp.sentVendorIds, ...vendorIds]));
      await storage.updateRfp(rfp.id, {
        sentVendorIds: allSentVendorIds,
        status: "sent",
      });

      // Update vendor lastContactedAt
      await Promise.all(
        validVendors.map((vendor) =>
          storage.updateVendor(vendor!.id, {
            lastContactedAt: new Date().toISOString(),
          } as any)
        )
      );

      const successCount = results.filter(Boolean).length;
      res.json({
        message: `RFP sent to ${successCount} of ${validVendors.length} vendors`,
        sentCount: successCount,
      });
    } catch (error) {
      console.error("Error sending RFP:", error);
      res.status(500).json({ message: "Failed to send RFP to vendors" });
    }
  });

  // Get Proposals for RFP
  app.get("/api/rfps/:id/proposals", async (req, res) => {
    try {
      const proposals = await storage.getProposalsByRfp(req.params.id);
      res.json(proposals);
    } catch (error) {
      console.error("Error getting proposals:", error);
      res.status(500).json({ message: "Failed to get proposals" });
    }
  });

  // Get Comparison for RFP
  app.get("/api/rfps/:id/comparison", async (req, res) => {
    try {
      const rfp = await storage.getRfp(req.params.id);
      if (!rfp) {
        return res.status(404).json({ message: "RFP not found" });
      }

      const proposals = await storage.getProposalsByRfp(req.params.id);
      if (proposals.length < 2) {
        return res.status(400).json({ message: "Need at least 2 proposals to compare" });
      }

      const comparison = await compareProposals(rfp, proposals);

      // Update RFP status to compared
      await storage.updateRfp(rfp.id, { status: "compared" });

      res.json(comparison);
    } catch (error) {
      console.error("Error comparing proposals:", error);
      res.status(500).json({ message: "Failed to compare proposals" });
    }
  });

  // Vendors
  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      console.error("Error getting vendors:", error);
      res.status(500).json({ message: "Failed to get vendors" });
    }
  });

  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      console.error("Error getting vendor:", error);
      res.status(500).json({ message: "Failed to get vendor" });
    }
  });

  app.post("/api/vendors", async (req, res) => {
    try {
      const parsed = insertVendorSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const vendor = await storage.createVendor(parsed.data);
      res.status(201).json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  app.patch("/api/vendors/:id", async (req, res) => {
    try {
      const vendor = await storage.updateVendor(req.params.id, req.body);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });

  app.delete("/api/vendors/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVendor(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });

  // Email Webhook (for receiving vendor responses)
  app.post("/api/email/webhook", async (req, res) => {
    try {
      const parsed = emailWebhookPayloadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { from, subject, text } = parsed.data;

      // Find the vendor by email
      const vendors = await storage.getVendors();
      const vendor = vendors.find((v) => from.toLowerCase().includes(v.email.toLowerCase()));

      if (!vendor) {
        console.log(`[WEBHOOK] Unknown sender: ${from}`);
        return res.status(200).json({ message: "Sender not recognized as a vendor" });
      }

      // Try to extract RFP ID from subject (format: "RE: Request for Proposal - {title}")
      const rfps = await storage.getRfps();
      const matchingRfp = rfps.find((rfp) =>
        subject.toLowerCase().includes(rfp.title.toLowerCase())
      );

      if (!matchingRfp) {
        console.log(`[WEBHOOK] Could not match email to an RFP. Subject: ${subject}`);
        return res.status(200).json({ message: "Could not match to an RFP" });
      }

      // Parse the vendor reply using AI
      const parsedReply = await parseVendorReply(text, from, matchingRfp.id);

      // Create the proposal
      const proposal = await storage.createProposal({
        rfpId: matchingRfp.id,
        vendorId: vendor.id,
        vendorName: parsedReply.vendorName || vendor.name,
        lineItems: parsedReply.lineItems,
        totalPrice: parsedReply.totalPrice,
        paymentTerms: parsedReply.paymentTerms,
        notes: parsedReply.notes,
        attachments: [],
      });

      console.log(`[WEBHOOK] Created proposal ${proposal.id} from ${vendor.name}`);
      res.status(201).json({ message: "Proposal created", proposalId: proposal.id });
    } catch (error) {
      console.error("Error processing email webhook:", error);
      res.status(500).json({ message: "Failed to process email" });
    }
  });

  // Proposals (direct access)
  app.get("/api/proposals", async (req, res) => {
    try {
      const proposals = await storage.getProposals();
      res.json(proposals);
    } catch (error) {
      console.error("Error getting proposals:", error);
      res.status(500).json({ message: "Failed to get proposals" });
    }
  });

  app.get("/api/proposals/:id", async (req, res) => {
    try {
      const proposal = await storage.getProposal(req.params.id);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      console.error("Error getting proposal:", error);
      res.status(500).json({ message: "Failed to get proposal" });
    }
  });

  return httpServer;
}
