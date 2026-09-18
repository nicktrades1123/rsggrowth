import type { Metadata } from "next";

export const site = {
  name: "RSG",
  url: "https://rsggrowth.com",
  email: "grow@rsggrowth.com",
};
export const navigation = [
  { href: "/what-we-do/", label: "What We Do" },
  { href: "/who-we-serve/", label: "Who We Serve" },
  { href: "/about/", label: "About RSG" },
  { href: "/contact/", label: "Contact" },
];
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | RSG`,
      description,
      url: path,
      type: "website",
    },
  };
}
export const capabilities = [
  {
    id: "strategy",
    number: "01",
    name: "Strategy",
    line: "Choose the right direction.",
    description:
      "Turn competing priorities into a clear business direction, grounded in where you are and where you want to go.",
    areas: [
      "Business planning & priorities",
      "Business model & positioning",
      "Decision frameworks & roadmaps",
    ],
    question: "What deserves your attention next?",
  },
  {
    id: "finance",
    number: "02",
    name: "Finance",
    line: "Know what drives the numbers.",
    description:
      "Connect financial visibility to better business decisions, from day-to-day cash needs to your next stage of growth.",
    areas: [
      "Cash flow planning & forecasting",
      "Budgeting & financial visibility",
      "Pricing, margins & unit economics",
    ],
    question: "What are your numbers telling you?",
  },
  {
    id: "growth",
    number: "03",
    name: "Growth",
    line: "Build a deliberate path forward.",
    description:
      "Identify the opportunities that fit your business, your customers, and your capacity to deliver.",
    areas: [
      "Growth priorities & market opportunities",
      "Customer acquisition & retention",
      "Sales process & commercial planning",
    ],
    question: "Where can your business grow with purpose?",
  },
  {
    id: "execution",
    number: "04",
    name: "Execution",
    line: "Make the plan happen.",
    description:
      "Translate decisions into practical actions, with clear ownership, useful measures, and a rhythm for following through.",
    areas: [
      "Operating plans & accountability",
      "Processes & ways of working",
      "Performance reviews & course correction",
    ],
    question: "How will the work move forward?",
  },
] as const;
