import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Naam is verplicht"),
  email: z.string().trim().email("Ongeldig e-mailadres").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional()
});

export const projectSchema = z.object({
  name: z.string().trim().min(2, "Projectnaam is verplicht"),
  description: z.string().trim().optional(),
  customerId: z.string().optional().or(z.literal(""))
});

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, "Omschrijving is verplicht"),
  quantity: z.coerce.number().positive("Aantal moet groter zijn dan 0"),
  unitPrice: z.coerce.number().nonnegative("Prijs mag niet negatief zijn"),
  vatRate: z.coerce.number().min(0).max(100)
});

export const invoiceSchema = z.object({
  title: z.string().trim().min(2, "Factuurtitel is verplicht"),
  invoiceDate: z.string().trim().min(1, "Datum is verplicht"),
  customerId: z.string().optional().or(z.literal("")),
  projectId: z.string().optional().or(z.literal("")),
  notes: z.string().trim().optional(),
  items: z.array(invoiceItemSchema).min(1, "Voeg minimaal 1 materiaalregel toe")
});
