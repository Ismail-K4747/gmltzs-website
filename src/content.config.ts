import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ---------- Reusable field schemas ----------

const galleryPhoto = z.object({
  image: z.string(),                  // /uploads/foo.jpg path
  caption: z.string().optional(),
  alt: z.string().optional(),
});

const ctaButton = z.object({
  label: z.string(),
  href: z.string(),
  style: z.enum(['primary', 'ghost', 'outline']).default('primary'),
});

const statItem = z.object({
  number: z.string(),
  label: z.string(),
});

const valueItem = z.object({
  title: z.string(),
  description: z.string(),
});

const aboutCard = z.object({
  title: z.string(),
  description: z.string(),
});

const businessCard = z.object({
  id: z.string(),                     // e.g. "biz-devices" — used as anchor
  tag: z.string(),                    // "Medical Devices"
  tagStyle: z.enum(['default', 'soon']).default('default'),
  imageClass: z.string(),             // CSS modifier e.g. "biz-card__image--devices"
  logo: z.string().optional(),        // image path (optional for coming-soon)
  logoAlt: z.string().optional(),
  title: z.string(),
  description: z.string(),
  features: z.array(z.string()).default([]),
  link: z.string().optional(),        // Learn-More link
  comingSoonLabel: z.string().optional(), // shown if no link
  comingSoon: z.boolean().default(false),
});

const testimonial = z.object({
  quote: z.string(),
  initials: z.string(),
  name: z.string(),
  role: z.string(),
});

const businessService = z.object({
  title: z.string(),
  description: z.string(),
  iconSvg: z.string().optional(), // raw inner SVG markup (paths/circles/etc.)
});

const ctaBanner = z.object({
  title: z.string(),
  description: z.string(),
  buttonLabel: z.string().default('Get in Touch'),
  buttonHref: z.string().default('/#contact'),
});

const insightArticle = z.object({
  tag: z.string(),
  title: z.string(),
  excerpt: z.string(),
  author: z.string(),
  dateLabel: z.string(),         // human-readable, e.g. "March 2026"
  datetime: z.string().optional(),// ISO-ish, e.g. "2026-03"
});

const legalSection = z.object({
  title: z.string(),
  body: z.string(), // HTML/markdown allowed
});

// ---------- Real-estate-specific sub-schemas ----------
const projectStat = z.object({
  value: z.string(),
  label: z.string(),
});

const projectFeature = z.object({
  title: z.string(),
  description: z.string(),
  iconSvg: z.string().optional(),
});

const galleryThumb = z.object({
  image: z.string(),
  alt: z.string().optional(),
  countOverlay: z.string().optional(), // e.g. "+15 Photos"
});

const progressCard = z.object({
  index: z.number(),
  markerLabel: z.string(),       // e.g. "Feb 2026"
  markerAriaLabel: z.string().optional(),
  mediaType: z.enum(['image', 'video']).default('image'),
  mediaUrl: z.string(),
  posterUrl: z.string().optional(),
  overlayLabel: z.string().optional(),  // e.g. "Still Frame", "Autoplay on View"
  overlayHeadline: z.string().optional(),
  dateLabel: z.string(),
  title: z.string(),
  caption: z.string(),
  active: z.boolean().default(false),
});

const videoTourSlide = z.object({
  videoUrl: z.string(),
  posterUrl: z.string().optional(),
});

// ---------- Pages collection ----------
// Each page = one Markdown/MDX-ish data file with frontmatter only.
// We keep body empty (or use it as a generic rich-text override slot).

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    // SEO / meta
    title: z.string(),
    metaDescription: z.string(),
    metaKeywords: z.string().optional(),
    canonical: z.string().optional(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),

    // Hero
    heroEyebrow: z.string().optional(),
    heroTitle: z.string().optional(),
    heroTitleAccent: z.string().optional(),
    heroSubtitle: z.string().optional(),
    heroActions: z.array(ctaButton).default([]),
    heroStats: z.array(statItem).default([]),

    // About / intro section
    aboutEyebrow: z.string().optional(),
    aboutTitle: z.string().optional(),
    aboutLead: z.string().optional(),
    aboutParagraphs: z.array(z.string()).default([]),
    aboutCtaLabel: z.string().optional(),
    aboutCtaHref: z.string().optional(),
    aboutCards: z.array(aboutCard).default([]),

    // Businesses (homepage)
    businessesEyebrow: z.string().optional(),
    businessesTitle: z.string().optional(),
    businessesSubtitle: z.string().optional(),
    businesses: z.array(businessCard).default([]),

    // Values (homepage)
    valuesEyebrow: z.string().optional(),
    valuesTitle: z.string().optional(),
    values: z.array(valueItem).default([]),

    // Testimonials
    testimonialsEyebrow: z.string().optional(),
    testimonialsTitle: z.string().optional(),
    testimonials: z.array(testimonial).default([]),

    // Contact
    contactEyebrow: z.string().optional(),
    contactTitle: z.string().optional(),
    contactSubtitle: z.string().optional(),

    // Generic body sections (for inner pages: medics, lab, etc.)
    bodySections: z
      .array(
        z.object({
          eyebrow: z.string().optional(),
          title: z.string().optional(),
          body: z.string().optional(), // markdown/HTML allowed
          image: z.string().optional(),
        })
      )
      .default([]),

    // Photo gallery (THIS is what the client uses to add photos)
    galleryTitle: z.string().optional(),
    galleryPhotos: z.array(galleryPhoto).default([]),

    // ---- Inner-page-specific fields ----

    // Theme & layout
    pageTheme: z.string().optional(),         // e.g. "devices", "medics", "laboratory"
    pageHeroBgClass: z.string().optional(),   // e.g. "page-hero__bg--devices"
    pageHeroTag: z.string().optional(),
    pageHeroTitle: z.string().optional(),
    pageHeroDescription: z.string().optional(),
    pageHeroGradient: z.boolean().default(false), // for terms/privacy gradient hero

    // Page-about / intro on inner pages
    pageAboutEyebrow: z.string().optional(),
    pageAboutTitle: z.string().optional(),
    pageAboutParagraphs: z.array(z.string()).default([]),

    // Business services grid (inner pages)
    services: z.array(businessService).default([]),

    // CTA banner
    ctaBanner: ctaBanner.optional(),

    // WhatsApp float (inner pages)
    whatsappMessage: z.string().optional(),

    // Insights
    insightsArticles: z.array(insightArticle).default([]),

    // Legal pages
    legalLastUpdated: z.string().optional(),
    legalSections: z.array(legalSection).default([]),
    legalContactBlock: z.string().optional(), // HTML allowed

    // ---- Real-estate-specific ----
    projectEyebrow: z.string().optional(),
    projectTitle: z.string().optional(),
    projectSubtitle: z.string().optional(),
    projectStats: z.array(projectStat).default([]),
    projectFeatures: z.array(projectFeature).default([]),
    // Gallery: main + 4 thumbs (with last one being "+N Photos")
    projectGalleryAllImages: z.array(z.string()).default([]),
    projectGalleryMain: galleryThumb.optional(),
    projectGalleryThumbs: z.array(galleryThumb).default([]),
    // Video tour
    videoTourSlides: z.array(videoTourSlide).default([]),
    // Progress timeline
    progressCards: z.array(progressCard).default([]),
    projectEnquireButtonLabel: z.string().optional(),
  }),
});

// ---------- Site-wide settings collection ----------

const settings = defineCollection({
  loader: glob({ pattern: '**/*.{json,yml,yaml}', base: './src/content/settings' }),
  schema: z.object({
    siteName: z.string().default('GM Group'),
    siteTagline: z.string().optional(),
    contactEmail: z.string().email().default('info@gmltzs.com'),
    contactPhone: z.string().optional(),
    contactFax: z.string().optional(),
    address: z.string().optional(),
    headOfficeMapEmbed: z.string().optional(),
    socials: z
      .array(
        z.object({
          platform: z.string(),
          url: z.string().url(),
        })
      )
      .default([]),
    footerTagline: z.string().optional(),
    footerLegal: z.string().optional(),
  }),
});

export const collections = { pages, settings };
