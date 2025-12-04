import { randomUUID } from "crypto";
import type {
  Rfp,
  InsertRfp,
  Vendor,
  InsertVendor,
  Proposal,
  InsertProposal,
  DashboardStats,
  RfpStatus,
} from "@shared/schema";

export interface IStorage {
  // RFPs
  getRfps(): Promise<Rfp[]>;
  getRfp(id: string): Promise<Rfp | undefined>;
  createRfp(rfp: InsertRfp): Promise<Rfp>;
  updateRfp(id: string, updates: Partial<Rfp>): Promise<Rfp | undefined>;
  deleteRfp(id: string): Promise<boolean>;

  // Vendors
  getVendors(): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, updates: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: string): Promise<boolean>;

  // Proposals
  getProposals(): Promise<Proposal[]>;
  getProposalsByRfp(rfpId: string): Promise<Proposal[]>;
  getProposal(id: string): Promise<Proposal | undefined>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private rfps: Map<string, Rfp>;
  private vendors: Map<string, Vendor>;
  private proposals: Map<string, Proposal>;

  constructor() {
    this.rfps = new Map();
    this.vendors = new Map();
    this.proposals = new Map();

    // Seed initial data
    this.seedData();
  }

  private seedData() {
    // Seed vendors
    const vendors: Vendor[] = [
      {
        id: "vendor-1",
        name: "TechSupply Co.",
        email: "sales@techsupply.com",
        contactPerson: "John Smith",
        rating: 5,
        capabilities: ["IT Hardware", "Laptops", "Servers", "Networking"],
        tags: ["Preferred", "Enterprise"],
        lastContactedAt: null,
      },
      {
        id: "vendor-2",
        name: "Office Solutions Inc.",
        email: "rfp@officesolutions.com",
        contactPerson: "Sarah Johnson",
        rating: 4,
        capabilities: ["Office Equipment", "Furniture", "Supplies"],
        tags: ["Local", "Small Business"],
        lastContactedAt: null,
      },
      {
        id: "vendor-3",
        name: "Global Tech Partners",
        email: "procurement@globaltech.com",
        contactPerson: "Michael Chen",
        rating: 4,
        capabilities: ["IT Hardware", "Software", "Cloud Services", "Support"],
        tags: ["International", "24/7 Support"],
        lastContactedAt: null,
      },
    ];

    vendors.forEach((v) => this.vendors.set(v.id, v));

    // Seed a sample RFP
    const sampleRfp: Rfp = {
      id: "rfp-sample-1",
      title: "Office Laptop Procurement Q1 2025",
      items: [
        { name: "Business Laptop", qty: 50, specs: "Intel i7, 16GB RAM, 512GB SSD" },
        { name: "Laptop Bag", qty: 50, specs: "Professional carry bag with padding" },
        { name: "Wireless Mouse", qty: 50, specs: "Ergonomic, Bluetooth/USB receiver" },
      ],
      totalBudget: 75000,
      currency: "USD",
      deliveryDays: 30,
      paymentTerms: "Net 30",
      warranty: "3 years",
      notes: "Prefer energy-efficient models with Windows 11 Pro pre-installed.",
      mandatoryCriteria: ["3-year warranty", "Windows 11 Pro", "On-site support"],
      optionalCriteria: ["Extended battery", "Fingerprint reader"],
      status: "received",
      sentVendorIds: ["vendor-1", "vendor-3"],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.rfps.set(sampleRfp.id, sampleRfp);

    // Seed sample proposals
    const proposals: Proposal[] = [
      {
        id: "proposal-1",
        rfpId: "rfp-sample-1",
        vendorId: "vendor-1",
        vendorName: "TechSupply Co.",
        lineItems: [
          { itemName: "Business Laptop", qty: 50, unitPrice: 1200, totalPrice: 60000, warranty: "3 years", deliveryDays: 21 },
          { itemName: "Laptop Bag", qty: 50, unitPrice: 45, totalPrice: 2250, warranty: "1 year", deliveryDays: 21 },
          { itemName: "Wireless Mouse", qty: 50, unitPrice: 35, totalPrice: 1750, warranty: "2 years", deliveryDays: 21 },
        ],
        totalPrice: 64000,
        paymentTerms: "Net 30",
        notes: "Includes free setup and deployment assistance. Extended warranty options available.",
        attachments: [],
        receivedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "proposal-2",
        rfpId: "rfp-sample-1",
        vendorId: "vendor-3",
        vendorName: "Global Tech Partners",
        lineItems: [
          { itemName: "Business Laptop", qty: 50, unitPrice: 1150, totalPrice: 57500, warranty: "3 years", deliveryDays: 28 },
          { itemName: "Laptop Bag", qty: 50, unitPrice: 40, totalPrice: 2000, warranty: "1 year", deliveryDays: 28 },
          { itemName: "Wireless Mouse", qty: 50, unitPrice: 30, totalPrice: 1500, warranty: "2 years", deliveryDays: 28 },
        ],
        totalPrice: 61000,
        paymentTerms: "Net 45",
        notes: "Bulk discount applied. 24/7 support included for first year.",
        attachments: [],
        receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    proposals.forEach((p) => this.proposals.set(p.id, p));
  }

  // RFPs
  async getRfps(): Promise<Rfp[]> {
    return Array.from(this.rfps.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRfp(id: string): Promise<Rfp | undefined> {
    return this.rfps.get(id);
  }

  async createRfp(insertRfp: InsertRfp): Promise<Rfp> {
    const id = randomUUID();
    const rfp: Rfp = {
      ...insertRfp,
      id,
      status: "draft",
      sentVendorIds: [],
      createdAt: new Date().toISOString(),
    };
    this.rfps.set(id, rfp);
    return rfp;
  }

  async updateRfp(id: string, updates: Partial<Rfp>): Promise<Rfp | undefined> {
    const rfp = this.rfps.get(id);
    if (!rfp) return undefined;

    const updated = { ...rfp, ...updates };
    this.rfps.set(id, updated);
    return updated;
  }

  async deleteRfp(id: string): Promise<boolean> {
    return this.rfps.delete(id);
  }

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = randomUUID();
    const vendor: Vendor = {
      ...insertVendor,
      id,
      lastContactedAt: null,
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async updateVendor(id: string, updates: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;

    const updated = { ...vendor, ...updates };
    this.vendors.set(id, updated);
    return updated;
  }

  async deleteVendor(id: string): Promise<boolean> {
    return this.vendors.delete(id);
  }

  // Proposals
  async getProposals(): Promise<Proposal[]> {
    return Array.from(this.proposals.values());
  }

  async getProposalsByRfp(rfpId: string): Promise<Proposal[]> {
    return Array.from(this.proposals.values()).filter((p) => p.rfpId === rfpId);
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }

  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const id = randomUUID();
    const proposal: Proposal = {
      ...insertProposal,
      id,
      receivedAt: new Date().toISOString(),
    };
    this.proposals.set(id, proposal);

    // Update RFP status to received
    const rfp = this.rfps.get(insertProposal.rfpId);
    if (rfp && rfp.status === "sent") {
      this.rfps.set(rfp.id, { ...rfp, status: "received" });
    }

    return proposal;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const rfps = Array.from(this.rfps.values());
    const activeStatuses: RfpStatus[] = ["sent", "received"];

    return {
      totalRfps: rfps.length,
      activeRfps: rfps.filter((r) => activeStatuses.includes(r.status)).length,
      totalVendors: this.vendors.size,
      proposalsReceived: this.proposals.size,
    };
  }
}

export const storage = new MemStorage();
