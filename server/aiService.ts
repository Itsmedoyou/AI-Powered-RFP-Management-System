import OpenAI from "openai";
import type { InsertRfp, Proposal, Rfp, ProposalScore, ComparisonResult } from "@shared/schema";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EXTRACT_RFP_PROMPT = `You are an assistant that extracts procurement requirements into strict JSON. Input: a natural language paragraph describing what to buy. Output: a single JSON object with keys:
title, items (array of {name, qty, specs}), totalBudget (number in USD or null), currency (string, default "USD"), deliveryDays (integer or null), paymentTerms (string or null), warranty (string or null), notes (string or null), mandatoryCriteria (array of strings), optionalCriteria (array of strings).

If any numeric field is not stated, set it to null. DO NOT include extra text. Return valid JSON only.

Rules:
- Extract specific product names and quantities
- Parse budget amounts and convert to numbers
- Identify delivery timeline requirements
- Extract payment and warranty terms
- List any mandatory requirements as mandatoryCriteria
- List nice-to-have features as optionalCriteria
- Generate a concise title summarizing the procurement`;

const PARSE_REPLY_PROMPT = `You receive an email body (may include free text and pasted tables). Extract a proposal JSON:
{ vendorName, lineItems: [{ itemName, qty, unitPrice, totalPrice, warranty, deliveryDays }], totalPrice, paymentTerms, notes }.

Rules:
- Identify the vendor name from email signature or content
- Extract all line items with quantities and prices
- Parse currencies and convert to numbers
- Calculate totals if not explicitly stated
- Extract warranty and delivery information per item if available
- Capture payment terms
- Include any additional notes or terms

Return JSON only, no additional text.`;

const COMPARE_PROMPT = `You are a procurement advisor. Compare the following vendor proposals for an RFP and provide:
1. A summary paragraph comparing the key differences
2. Your recommendation for which vendor to select
3. The reason for your recommendation

Consider: total price, delivery time, warranty coverage, completeness of proposal, and vendor reliability.

Return JSON with keys: summary (string), recommendedVendorId (string), reason (string).`;

export async function extractRfpFromNL(text: string): Promise<InsertRfp> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: EXTRACT_RFP_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);

    // Ensure required fields have defaults
    return {
      title: parsed.title || "Untitled RFP",
      items: parsed.items || [],
      totalBudget: parsed.totalBudget ?? null,
      currency: parsed.currency || "USD",
      deliveryDays: parsed.deliveryDays ?? null,
      paymentTerms: parsed.paymentTerms ?? null,
      warranty: parsed.warranty ?? null,
      notes: parsed.notes ?? null,
      mandatoryCriteria: parsed.mandatoryCriteria || [],
      optionalCriteria: parsed.optionalCriteria || [],
    };
  } catch (error) {
    console.error("Error extracting RFP:", error);
    throw new Error("Failed to extract RFP from natural language input");
  }
}

export async function parseVendorReply(
  emailText: string,
  vendorEmail: string,
  rfpId: string
): Promise<{
  vendorName: string;
  lineItems: Array<{
    itemName: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
    warranty: string | null;
    deliveryDays: number | null;
  }>;
  totalPrice: number;
  paymentTerms: string | null;
  notes: string | null;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: PARSE_REPLY_PROMPT },
        { role: "user", content: `Email from: ${vendorEmail}\n\n${emailText}` },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);

    return {
      vendorName: parsed.vendorName || "Unknown Vendor",
      lineItems: (parsed.lineItems || []).map((item: any) => ({
        itemName: item.itemName || "",
        qty: Number(item.qty) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        totalPrice: Number(item.totalPrice) || 0,
        warranty: item.warranty || null,
        deliveryDays: item.deliveryDays ? Number(item.deliveryDays) : null,
      })),
      totalPrice: Number(parsed.totalPrice) || 0,
      paymentTerms: parsed.paymentTerms || null,
      notes: parsed.notes || null,
    };
  } catch (error) {
    console.error("Error parsing vendor reply:", error);
    throw new Error("Failed to parse vendor reply");
  }
}

export async function compareProposals(
  rfp: Rfp,
  proposals: Proposal[]
): Promise<ComparisonResult> {
  // Calculate deterministic scores
  const scores: ProposalScore[] = await Promise.all(
    proposals.map(async (proposal) => {
      const vendor = await storage.getVendor(proposal.vendorId);
      const vendorRating = vendor?.rating || 3;

      // Price score: lower is better (normalized against budget or min price)
      const minPrice = Math.min(...proposals.map((p) => p.totalPrice));
      const maxPrice = Math.max(...proposals.map((p) => p.totalPrice));
      const priceRange = maxPrice - minPrice || 1;
      const priceScore = ((maxPrice - proposal.totalPrice) / priceRange) * 100;

      // Delivery score: faster is better
      const avgDelivery =
        proposal.lineItems.reduce((sum, item) => sum + (item.deliveryDays || 30), 0) /
        proposal.lineItems.length;
      const targetDelivery = rfp.deliveryDays || 30;
      const deliveryScore = Math.max(0, 100 - ((avgDelivery - targetDelivery) / targetDelivery) * 100);

      // Warranty score: based on coverage
      const hasWarranty = proposal.lineItems.filter((item) => item.warranty).length;
      const warrantyScore = (hasWarranty / proposal.lineItems.length) * 100;

      // Completeness score: based on how many RFP items are addressed
      const completenessScore = Math.min(
        100,
        (proposal.lineItems.length / rfp.items.length) * 100
      );

      // Vendor rating score
      const vendorRatingScore = (vendorRating / 5) * 100;

      // Weighted total
      const totalScore =
        priceScore * 0.4 +
        deliveryScore * 0.2 +
        warrantyScore * 0.15 +
        completenessScore * 0.15 +
        vendorRatingScore * 0.1;

      return {
        proposalId: proposal.id,
        vendorName: proposal.vendorName,
        priceScore: Math.round(priceScore * 10) / 10,
        deliveryScore: Math.round(deliveryScore * 10) / 10,
        warrantyScore: Math.round(warrantyScore * 10) / 10,
        completenessScore: Math.round(completenessScore * 10) / 10,
        vendorRatingScore: Math.round(vendorRatingScore * 10) / 10,
        totalScore: Math.round(totalScore * 10) / 10,
      };
    })
  );

  // Get AI analysis for textual summary
  try {
    const proposalSummaries = proposals.map((p, i) => ({
      vendorName: p.vendorName,
      vendorId: p.vendorId,
      totalPrice: p.totalPrice,
      itemCount: p.lineItems.length,
      score: scores[i].totalScore,
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: COMPARE_PROMPT },
        {
          role: "user",
          content: `RFP: ${rfp.title}\nBudget: ${rfp.totalBudget || "Not specified"}\nRequired items: ${rfp.items.length}\n\nProposals:\n${JSON.stringify(proposalSummaries, null, 2)}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);

    // Find the best scoring proposal as fallback
    const bestScore = scores.reduce((best, current) =>
      current.totalScore > best.totalScore ? current : best
    );
    const bestProposal = proposals.find((p) => p.id === bestScore.proposalId);

    return {
      scores,
      summary: parsed.summary || "Comparison analysis not available.",
      recommendedVendorId: parsed.recommendedVendorId || bestProposal?.vendorId || "",
      reason: parsed.reason || `Based on the weighted scoring, ${bestProposal?.vendorName} offers the best overall value.`,
    };
  } catch (error) {
    console.error("Error comparing proposals:", error);

    // Fallback to deterministic comparison
    const bestScore = scores.reduce((best, current) =>
      current.totalScore > best.totalScore ? current : best
    );
    const bestProposal = proposals.find((p) => p.id === bestScore.proposalId);

    return {
      scores,
      summary: `Comparing ${proposals.length} proposals. Scores are based on price (40%), delivery (20%), warranty (15%), completeness (15%), and vendor rating (10%).`,
      recommendedVendorId: bestProposal?.vendorId || "",
      reason: `Based on the weighted scoring analysis, ${bestProposal?.vendorName} achieves the highest overall score of ${bestScore.totalScore.toFixed(1)}/100.`,
    };
  }
}
