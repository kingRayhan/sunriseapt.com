export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Founder & CEO",
    bio: "With over 15 years of experience in South Florida real estate, Sarah founded Sunriseapt to provide a personalized and transparent property buying experience.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
  },
  {
    id: "2",
    name: "Michael Torres",
    role: "Head of Sales",
    bio: "Michael brings a decade of expertise in luxury property sales. His deep knowledge of the local market helps clients find their perfect homes.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
  },
  {
    id: "3",
    name: "Emily Chen",
    role: "Property Manager",
    bio: "Emily ensures every property in our portfolio meets the highest standards. Her attention to detail and client-first approach sets us apart.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
  },
  {
    id: "4",
    name: "David Okafor",
    role: "Marketing Director",
    bio: "David leverages cutting-edge marketing strategies to showcase our properties to the right audience, ensuring maximum visibility and engagement.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  },
];
