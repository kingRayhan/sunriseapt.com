import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export type FooterSocialLinks = {
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
};

export type FooterContactInfo = {
  companyName: string | null;
  address: string | null;
  phones: string[];
  emails: string[];
};

type FooterProps = {
  socialLinks?: FooterSocialLinks;
  contactInfo?: FooterContactInfo;
};

function Footer({ socialLinks, contactInfo }: FooterProps) {
  const hasSocial =
    socialLinks &&
    (socialLinks.facebook ||
      socialLinks.twitter ||
      socialLinks.instagram ||
      socialLinks.linkedin ||
      socialLinks.youtube);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12 lg:gap-16 max-w-5xl">
          <div className="max-w-md">
            <img
              src="/full-logo.png"
              alt="Sunrise Apartments"
              className="h-11 w-auto mb-5 brightness-0 invert"
            />
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Your trusted partner in finding the perfect property. We bring expertise, integrity, and personalized service to every transaction.
            </p>
            {hasSocial && (
              <div className="mt-6 flex flex-wrap gap-4">
                {socialLinks!.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground/70 hover:text-gold transition-colors rounded-full p-1.5 hover:bg-primary-foreground/10"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {socialLinks!.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground/70 hover:text-gold transition-colors rounded-full p-1.5 hover:bg-primary-foreground/10"
                    aria-label="Twitter / X"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {socialLinks!.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground/70 hover:text-gold transition-colors rounded-full p-1.5 hover:bg-primary-foreground/10"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {socialLinks!.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground/70 hover:text-gold transition-colors rounded-full p-1.5 hover:bg-primary-foreground/10"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {socialLinks!.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground/70 hover:text-gold transition-colors rounded-full p-1.5 hover:bg-primary-foreground/10"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="min-w-0 md:max-w-sm">
            <h4 className="font-semibold text-base mb-5">Contact Us</h4>
            <ul className="space-y-5 text-sm text-primary-foreground/80 leading-relaxed">
              {contactInfo?.address && (
                <li className="flex gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-gold mt-0.5" />
                  <span>{contactInfo.address}</span>
                </li>
              )}
              {contactInfo?.phones && contactInfo.phones.length > 0 && (
                <li className="flex gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-gold mt-0.5" />
                  <span className="flex flex-col gap-1">
                    {contactInfo.phones.map((phone, i) => (
                      <span key={i}>{phone}</span>
                    ))}
                  </span>
                </li>
              )}
              {contactInfo?.emails && contactInfo.emails.length > 0 && (
                <li className="flex gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-gold mt-0.5" />
                  <span className="flex flex-col gap-1">
                    {contactInfo.emails.map((email, i) => (
                      <span key={i}>{email}</span>
                    ))}
                  </span>
                </li>
              )}
              {!contactInfo?.address && !(contactInfo?.phones?.length) && !(contactInfo?.emails?.length) && (
                <li className="text-primary-foreground/50">No contact info configured.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} {contactInfo?.companyName || "Sunrise Apartments Ltd."}. All rights reserved.</p>
          <p>
            Site crafted by{" "}
            <a
              href="https://graphland.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors font-medium"
            >
              Graphland
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
