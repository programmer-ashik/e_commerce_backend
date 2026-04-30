import z from "zod";

const shippingSchema = z.object({
  weight: z.number().min(0).default(0),
  dimensions: z
    .object({
      length: z.number().min(0).optional(),
      width: z.number().min(0).optional(),
      height: z.number().min(0).optional(),
    })
    .optional(),
  isFreeShipping: z.boolean().default(false),
  shippingCost: z.number().min(0).default(0),
  estimatedDelivery: z.string().optional(),
});
const seoSchema = z.object({
  title: z.string().max(100).optional(),
  description: z.string().max(200).optional(),
  keywords: z.array(z.string()).optional(),
});
export const createProductValidation = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(200),
    description: z.any(),
    price: z.coerce.number().positive("Price must be a positive number"),
    discount: z.coerce.number().min(0).max(100).default(0),
    stock: z.coerce.number().min(0).default(0),
    category: z.string().min(1, "Category is required"),
    subcategory: z.string().optional(),
    brand: z.string().optional(),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    shipping: shippingSchema.optional(),
    seo: seoSchema.optional(),
    variants: z.array(z.any()).optional(),

    specifications: z.record(z.string()).optional(),
  }),
  //   url parameters
  params: z.object({
    id: z.string().optional(),
  }),
  // query string (as ?page=1)
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
