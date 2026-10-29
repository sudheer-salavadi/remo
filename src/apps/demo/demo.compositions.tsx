import { Composition, Folder } from "remotion";
import { BarChart, barChartFrames } from "../../templates/Social/BarChart";
import type { Brand } from "../../templates/Social/brand";
import { Quote, quoteFrames } from "../../templates/Social/Quote";
import { barChartSchema, quoteSchema, statCardsSchema } from "../../templates/Social/schema";
import { StatCards, statCardsFrames } from "../../templates/Social/StatCards";

/**
 * Demo app: a fictional brand and sample data, showing each Social template.
 * Copy this folder to src/apps/<your-app>/ (gitignored by default), rename the file to <your-app>.compositions.tsx,
 * and swap in your brand and content.
 */
const reel = { fps: 60, width: 1080, height: 1920, durationInFrames: 1 } as const;

const brand = (bg: string): Brand => ({
  name: "Fieldnote",
  url: "example.com",
  ink: "#1f1f1d",
  sub: "#5c5c5a",
  bg,
  // Rounded square with a check cut out.
  logoPath: "M20 0H80A20 20 0 0 1 100 20V80A20 20 0 0 1 80 100H20A20 20 0 0 1 0 80V20A20 20 0 0 1 20 0ZM27 52L43 68L74 34L67 27L43 54L34 45Z",
  logoViewBox: "0 0 100 100",
});

export default function DemoCompositions() {
  return (
    <Folder name="Demo-Social">
      <Composition
        id="Demo-Stats"
        component={StatCards}
        schema={statCardsSchema}
        calculateMetadata={({ props }) => ({ durationInFrames: statCardsFrames(props) })}
        {...reel}
        defaultProps={{
          brand: brand("#dce3eb"),
          hook: { eyebrow: "SAMPLE DATA", title: "A week in the field,", italic: "by the numbers.", emoji: "🧰" },
          title: "This week at Fieldnote",
          subtitle: "Sample numbers for the template",
          layout: "stack",
          stats: [
            { label: "Jobs booked", value: "1,240", note: "Across all crews", emoji: "📅", visual: "crowd" },
            { label: "Average ticket", value: "$86.40", note: "Per completed job", emoji: "💵", visual: "none" },
            { label: "On-time arrivals", value: "92%", note: "Within the booked window", emoji: "⏱️", visual: "ring" },
            { label: "Outlook", value: "Growing", note: "Next quarter", emoji: "📈", visual: "trend" },
          ],
          endLine: "Your line here. Make it short.",
          source: "Sample data",
        }}
      />
      <Composition
        id="Demo-Stats-Spotlight"
        component={StatCards}
        schema={statCardsSchema}
        calculateMetadata={({ props }) => ({ durationInFrames: statCardsFrames(props) })}
        {...reel}
        defaultProps={{
          brand: brand("#e3dfea"),
          hook: { title: "Three numbers", italic: "worth knowing.", emoji: "🇺🇸🇨🇦" },
          title: "Sample spotlight",
          layout: "spotlight",
          stats: [
            { label: "Customers served", value: "18,500", note: "Sample figure", emoji: "🙋", visual: "emoji" },
            { label: "Repeat bookings", value: "1 in 3", note: "Words and fractions wipe on", visual: "none" },
            { label: "Five-star reviews", value: "25%", note: "Rings fill to the percentage", emoji: "⭐", visual: "ring" },
          ],
          endLine: "Your line here. Make it short.",
          source: "Sample data",
        }}
      />
      <Composition
        id="Demo-Bars"
        component={BarChart}
        schema={barChartSchema}
        calculateMetadata={({ props }) => ({ durationInFrames: barChartFrames(props) })}
        {...reel}
        defaultProps={{
          brand: brand("#efe9d4"),
          hook: { title: "What a job", italic: "is worth.", sub: "Average ticket and the top 10%", emoji: "💰" },
          title: "Average job value",
          legend: ["Average", "Top 10%"],
          prefix: "$",
          suffix: "",
          topNote: "Top 10% above {top}",
          rows: [
            { name: "Plumbing", emoji: "🔧", value: 420, top: 910 },
            { name: "Electrical", emoji: "⚡", value: 380, top: 840 },
            { name: "HVAC", emoji: "❄️", value: 510, top: 1200 },
            { name: "Cleaning", emoji: "🧽", value: 160, top: 290 },
          ],
          endLine: "Your line here. Make it short.",
          source: "Sample data",
        }}
      />
      <Composition
        id="Demo-Quote"
        component={Quote}
        schema={quoteSchema}
        calculateMetadata={({ props }) => ({ durationInFrames: quoteFrames(props) })}
        {...reel}
        defaultProps={{
          brand: brand("#eceae4"),
          image: "apps/demo/backdrop.jpg",
          focus: "50% 20%",
          chip: "SAMPLE HEADLINE",
          lead: "Put a photo here, then a headline that says",
          highlight: "one key phrase",
          rest: "gets a marker highlight, with a source line below.",
          endLine: "Your line here. Make it short.",
          source: "Name the outlet or report",
        }}
      />
    </Folder>
  );
}
