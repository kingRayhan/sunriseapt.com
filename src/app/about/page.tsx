import { Target, Eye, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { teamMembers } from "@/data/team";

export default function AboutPage() {
  return (
    <div className="pt-20 lg:pt-24">
      <div className="bg-primary text-primary-foreground py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">About Sunriseapt</h1>
          <p className="text-primary-foreground/70">Our story, our values, our team</p>
        </div>
      </div>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Founded in 2015, Sunriseapt began with a simple belief: finding a home should be an exciting journey, not a stressful ordeal. What started as a boutique agency in Miami has grown into one of South Florida&apos;s most trusted real estate firms.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We&apos;ve helped over 500 families find their perfect homes, from beachfront condos to sprawling family estates. Our approach combines deep local expertise with genuine care for every client&apos;s unique needs and aspirations.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Our Mission",
                text: "To make the property search transparent, personalized, and enjoyable — connecting people with homes that match their lifestyle and dreams.",
              },
              {
                icon: Eye,
                title: "Our Vision",
                text: "To be the most trusted name in South Florida real estate, setting the standard for integrity, innovation, and client satisfaction.",
              },
              {
                icon: Users,
                title: "Our Values",
                text: "Honesty, expertise, and commitment. We treat every client like family, offering honest advice and going above and beyond to deliver results.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-none shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Meet Our Team</h2>
            <p className="text-muted-foreground">The people behind Sunriseapt</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden border-border">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-5 text-center">
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
