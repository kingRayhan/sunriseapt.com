import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <img
              src="/full-logo.png"
              alt="Sunrise Apartments"
              className="h-12 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Your trusted partner in finding the perfect property. We bring expertise, integrity, and personalized service to every transaction.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/properties", label: "Properties" },
                { href: "/about", label: "About Us" },
                { href: "/blog", label: "Blog" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Property Types</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>Apartments</li>
              <li>Villas</li>
              <li>Townhouses</li>
              <li>Penthouses</li>
              <li>Family Homes</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-primary-foreground/70">
                <MapPin className="h-4 w-4 mt-1 shrink-0 text-gold" />
                <span>Garden Valley Matin, House # 36 Flat E-1, 5th Floor, Garibe-e-Newaz Avenue Sector# 13, Uttara, Dhaka-1230</span>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/70">
                <Phone className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span>+88 01713 841977<br />+88 01713 873 944</span>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/70">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span>Sales@sunriseapt.com<br />Info@sunriseapt.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-center text-sm text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} Sunrise Apartments Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
