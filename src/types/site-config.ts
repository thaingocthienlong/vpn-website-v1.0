export interface CTAConfig {
  text: string;
  href: string;
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  videoUrl: string;
  ctaPrimary?: CTAConfig;
  ctaSecondary?: CTAConfig;
  featuredCourseIds: string[];
}

export interface ServicesConfig {
  title: string;
  subtitle: string;
}

export interface TrainingConfig {
  title: string;
  subtitle: string;
  displayCount: number;
}

export interface VideosConfig {
  title: string;
  subtitle: string;
  displayCount: number;
}

export interface PartnersConfig {
  title: string;
  subtitle: string;
  displayCount: number;
}

export interface ReviewsConfig {
  title: string;
  subtitle: string;
  displayCount: number;
}

export interface NewsConfig {
  title: string;
  subtitle: string;
  displayCount: number;
}

export interface GalleryConfig {
  title: string;
  subtitle: string;
}

export interface CTAButtonConfig {
  text: string;
  href: string;
}

export interface CTASectionConfig {
  title: string;
  subtitle: string;
  button: CTAButtonConfig;
}

export interface ContactConfig {
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface NavbarConfig {
  logoUrl: string;
  links: NavLink[];
  topBarText?: string;
  actionButtonText?: string;
  actionButtonUrl?: string;
}

export interface SocialLink {
  platform: 'facebook' | 'youtube' | 'linkedin' | 'tiktok' | 'twitter';
  url: string;
}

export interface FooterLinkColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterConfig {
  companyName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  socials: SocialLink[];
  columns: FooterLinkColumn[];
  copyright: string;
}

export interface SiteConfigurationData {
  hero?: HeroConfig;
  services?: ServicesConfig;
  training?: TrainingConfig;
  videos?: VideosConfig;
  partners?: PartnersConfig;
  reviews?: ReviewsConfig;
  news?: NewsConfig;
  gallery?: GalleryConfig;
  cta?: CTASectionConfig;
  contact?: ContactConfig;
  navbar?: NavbarConfig;
  footer?: FooterConfig;
}
