export type Testimonial = {
  id: string;
  title: string;
  /** Shown on hover in the same block as the title (extended story). */
  shortDescription: string;
  authorName: string;
  authorTitle: string;
  posterUrl: string;
  /** YouTube watch, short, or embed URL; optional for poster-only slides. */
  videoUrl: string;
  /** Optional line above the footer row (e.g. Bengali tagline). */
  overlayLine?: string;
  /** Shown on the media overlay (e.g. project name). */
  projectBrand: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    title: "A Journey to Finding Home",
    shortDescription:
      "Hear from Edison Adelia homeowners as they share their stories about their homes. Their experiences inspire us to keep providing the best for everyone we serve.",
    authorName: "Faisal Obaid",
    authorTitle: "Apartment owner",
    posterUrl:
      "https://images.unsplash.com/photo-1560250097-190b87022188?auto=format&fit=crop&q=80&w=1200",
    videoUrl: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
    overlayLine: "আপনার স্বপ্নের ঠিকানা",
    projectBrand: "Edison Adelia",
  },
  {
    id: "2",
    title: "Space That Grows With the Family",
    shortDescription:
      "Corner light, cross-ventilation, and practical storage made this home feel larger than the plan on paper. Sunrise kept every promise from the brochure walkthrough to handover.",
    authorName: "Nadia Rahman",
    authorTitle: "Apartment owner",
    posterUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    overlayLine: "পরিবারের জন্য নিরাপদ ঠিকানা",
    projectBrand: "Sunrise Halima Garden",
  },
  {
    id: "3",
    title: "Confidence From Day One",
    shortDescription:
      "Transparent timelines, responsive site teams, and finishing details that match the showroom gave us confidence long before we received the keys.",
    authorName: "Karim Hassan",
    authorTitle: "Apartment owner",
    posterUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=1200",
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    overlayLine: "বিশ্বাসযোগ্য ডেভেলপার",
    projectBrand: "Edison Luciana",
  },
];
