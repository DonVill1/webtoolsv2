export type ToolCategoryId =
  | "converters"
  | "calculators"
  | "developers"
  | "design"
  | "text"
  | "network";

export interface Category {
  id: ToolCategoryId;
  name: string;
  slug: ToolCategoryId;
  code: string;
  intro: string;
  description: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface ToolExample {
  input: string;
  output: string;
  note?: string;
}

export interface ToolContent {
  intro: string;
  howItWorks: string[];
  examples: ToolExample[];
  limits: string;
  faqs: Faq[];
}

export interface ToolDefinition {
  slug: string;
  name: string;
  category: ToolCategoryId;
  intent: string;
  seo: {
    title: string;
    description: string;
  };
  content: ToolContent;
  related: string[];
  og: {
    kicker: string;
    value: string;
  };
  status: "live" | "preview";
  added: string;
  updated: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  topic: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  body: string;
  relatedTools: string[];
}
