import { MapPin, MessageCircle, Phone } from "lucide-react";

const PHONES = [
  { display: "0551051122", tel: "+233551051122" },
  { display: "0546350848", tel: "+233546350848" },
] as const;

const WHATSAPP_CHAT = "https://wa.me/233551051122";
const MAPS_SEARCH =
  "https://www.google.com/maps/search/?api=1&query=5.631431862735625%2C-0.2949827988331736";
const MAPS_EMBED =
  "https://www.google.com/maps?q=5.631431862735625%2C-0.2949827988331736&output=embed";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-slate bg-void-black">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-semibold tracking-tight text-neon-silver">
            Savage Lifestyle Barber Shop
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-gray">
            Premium cuts, zero wait, booked on your schedule.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-gray">
            Contact
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-neon-silver">
            {PHONES.map((phone) => (
              <li key={phone.tel} className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-savage-gold" />
                <a href={`tel:${phone.tel}`} className="hover:text-savage-gold">
                  {phone.display}
                </a>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <MessageCircle size={14} className="shrink-0 text-savage-gold" />
              <a
                href={WHATSAPP_CHAT}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-savage-gold"
              >
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-gray">
            Location
          </h2>
          <p className="mt-3 flex items-start gap-2 text-sm text-neon-silver">
            <MapPin size={14} className="mt-0.5 shrink-0 text-savage-gold" />
            JPJ4+F2 Ablekuma Fan-Milk, Ghana
          </p>
          <a
            href={MAPS_SEARCH}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-savage-gold hover:text-gold-hover"
          >
            Get directions
          </a>
          <iframe
            title="Map of JPJ4+F2 Ablekuma Fan-Milk, Ghana"
            src={MAPS_EMBED}
            className="mt-3 h-32 w-full rounded-lg border border-border-slate"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-gray">
              Shop
            </h2>
            <p className="mt-3 text-sm text-muted-gray">
              Open by appointment. Book online to lock your chair.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
