import { z } from 'zod';

export const HeroSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  backgroundMediaId: z.string().optional(),
  cta: z.object({ label: z.string(), href: z.string().url() }).optional(),
});

export const GalleryItemSchema = z.object({
  mediaId: z.string(),
  caption: z.string().optional(),
});
export const GallerySchema = z.object({
  items: z.array(GalleryItemSchema).min(1),
  autoplay: z.boolean().optional(),
});

export const FeaturedMenuItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  price: z.number().optional(),
  mediaId: z.string().optional(),
});
export const FeaturedMenuSchema = z.object({
  items: z.array(FeaturedMenuItemSchema).min(1),
});

export const CtaSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  button: z.object({ label: z.string(), href: z.string().url() }),
});

export const TestimonialsItemSchema = z.object({
  name: z.string(),
  text: z.string(),
  avatarMediaId: z.string().optional(),
});
export const TestimonialsSchema = z.object({
  items: z.array(TestimonialsItemSchema).min(1),
});

export const RichTextSchema = z.object({ html: z.string().min(1) });
export const BannerSchema = z.object({ text: z.string(), mediaId: z.string().optional(), href: z.string().url().optional() });

export const ReservationFormSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  timeSlots: z.array(z.string()).optional(),
  maxPartySize: z.number().optional(),
});

export const SpecialOffersSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  offers: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    discount: z.number().optional(),
    validFrom: z.string(),
    validUntil: z.string(),
    imageUrl: z.string().optional(),
  })).optional(),
});

export const ContactInfoSchema = z.object({
  title: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional().or(z.literal('')),
  hours: z.array(z.object({ 
    day: z.string(), 
    time: z.string(),
    _id: z.string().optional(),
  })).optional(),
  mapEmbedUrl: z.string().optional().or(z.literal('')),
  socialLinks: z.array(z.object({ 
    platform: z.string(), 
    url: z.string().optional().or(z.literal('')),
    _id: z.string().optional(),
  })).optional(),
});

export const StatsSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  stats: z.array(z.object({
    icon: z.string(),
    value: z.number(),
    label: z.string(),
    suffix: z.string().optional(),
    prefix: z.string().optional(),
    color: z.string().optional(),
  })).min(1),
});

export type SchemaKind =
  | 'HERO'
  | 'GALLERY'
  | 'FEATURED_MENU'
  | 'CTA'
  | 'TESTIMONIALS'
  | 'RICH_TEXT'
  | 'BANNER'
  | 'RESERVATION_FORM'
  | 'SPECIAL_OFFERS'
  | 'CONTACT_INFO'
  | 'STATS';

export function getSchema(kind: string) {
  switch (kind) {
    case 'HERO':
      return HeroSchema;
    case 'GALLERY':
      return GallerySchema;
    case 'FEATURED_MENU':
      return FeaturedMenuSchema;
    case 'CTA':
      return CtaSchema;
    case 'TESTIMONIALS':
      return TestimonialsSchema;
    case 'RICH_TEXT':
      return RichTextSchema;
    case 'BANNER':
      return BannerSchema;
    case 'RESERVATION_FORM':
      return ReservationFormSchema;
    case 'SPECIAL_OFFERS':
      return SpecialOffersSchema;
    case 'CONTACT_INFO':
      return ContactInfoSchema;
    case 'STATS':
      return StatsSchema;
    default:
      return z.any();
  }
}


