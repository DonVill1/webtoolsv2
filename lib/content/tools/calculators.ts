import type { ToolDefinition } from "../types";

const date = "2026-10-28";

export const calculatorTools: ToolDefinition[] = [
  {
    slug: "percentage-calculator",
    name: "Percentage calculator",
    category: "calculators",
    intent: "calculate percentages, changes, discounts and markups",
    seo: {
      title: "Percentage Calculator — Change, Discount, Markup",
      description:
        "Work out a percentage of a number, the percentage change between two values, a discount price or a markup. Every answer shows the formula used.",
    },
    content: {
      intro:
        "Six related questions, one calculator: what is X% of Y, X is what percent of Y, the change from X to Y, an increase or decrease, a price after a discount, and a price after a markup.",
      howItWorks: [
        "Each mode is a single formula rather than a chain of rounded steps. A percentage of a value is (percent ÷ 100) × value; a percentage change is (new − old) ÷ old × 100. Discount and markup apply the percentage to the original amount and label the base each time.",
        "The explanation under the result restates the formula with your numbers substituted, which makes it possible to check the arithmetic or paste it into a spreadsheet.",
      ],
      examples: [
        { input: "15% of 240", output: "36", note: "0.15 × 240" },
        { input: "40 → 52", output: "+30%", note: "(52 − 40) ÷ 40" },
        { input: "80 less 20%", output: "64", note: "80 × 0.8" },
      ],
      limits:
        "A percentage change from zero is undefined and is reported as such rather than shown as infinity. Results are formatted to six significant figures, not as currency; the substituted working line keeps the arithmetic visible.",
      faqs: [
        {
          q: "What is the difference between percentage change and percentage points?",
          a: "Going from 10% to 12% is a 2 percentage-point rise but a 20% relative increase. This calculator reports the relative change, and the working line states both numbers so the distinction is visible.",
        },
        {
          q: "Why is a 20% discount not reversed by a 20% markup?",
          a: "Both percentages apply to a different base. 100 discounted by 20% is 80; 80 marked up by 20% is 96, not 100. The calculator shows the base each time.",
        },
        {
          q: "How is markup different from margin?",
          a: "Markup is a percentage of cost; margin is a percentage of the selling price. A 50% markup is a 33.3% margin. The markup mode labels which one it is computing.",
        },
      ],
    },
    related: ["bmi-calculator", "unit-converter", "timestamp-converter"],
    og: { kicker: "Calculators", value: "15% of 240 = 36" },
    status: "live",
    added: "2023-01-15",
    updated: date,
  },
  {
    slug: "bmi-calculator",
    name: "BMI calculator",
    category: "calculators",
    intent: "calculate body mass index in metric or imperial units",
    seo: {
      title: "BMI Calculator — Metric and Imperial",
      description:
        "Calculate BMI from height and weight in metric or imperial units, see the category, and get the healthy weight range for your height.",
    },
    content: {
      intro:
        "Body mass index is weight in kilograms divided by height in metres squared. Enter either unit system and the calculator converts once, at the start, then shows the category and the healthy range.",
      howItWorks: [
        "Imperial input is converted to metric before the formula runs, so both systems produce the same BMI. The category boundaries are the World Health Organization adult cut-offs: under 18.5, 18.5–24.9, 25–29.9, and 30 or above.",
        "The healthy range is derived by solving the same formula for weight at the bottom and top of the 18.5–24.9 band. It is a range for a height, not a target for an individual.",
      ],
      examples: [
        { input: "180 cm, 75 kg", output: "23.1", note: "75 ÷ 1.8²" },
        { input: "5 ft 10 in, 165 lb", output: "23.7", note: "same formula after conversion" },
      ],
      limits:
        "BMI does not distinguish muscle from fat, and it is not validated for children, pregnancy or people under 18. It is a population screening measure, not a diagnosis.",
      faqs: [
        {
          q: "Is BMI accurate for athletes?",
          a: "No. Muscle is denser than fat, so a muscular athlete can register as overweight while carrying little fat. Waist circumference or body composition is more useful in that case.",
        },
        {
          q: "Which BMI formula does this use?",
          a: "The WHO adult formula: kilograms divided by metres squared. Imperial values are converted first; there is no separate imperial formula with a 703 multiplier in the calculation.",
        },
        {
          q: "What is a healthy BMI?",
          a: "The WHO defines 18.5–24.9 as the healthy adult range. The calculator shows the corresponding weight range for your height rather than a single number.",
        },
      ],
    },
    related: ["percentage-calculator", "unit-converter", "birthday-countdown"],
    og: { kicker: "Calculators", value: "75 kg / 1.8 m = 23.1" },
    status: "live",
    added: "2023-08-15",
    updated: date,
  },
  {
    slug: "birthday-countdown",
    name: "Birthday countdown",
    category: "calculators",
    intent: "count the days until a birthday",
    seo: {
      title: "Birthday Countdown — Days Until Your Birthday",
      description:
        "Count the days, hours and minutes until your next birthday, see which weekday it falls on, and check how old you will turn.",
    },
    content: {
      intro:
        "Enter a birth date and get a live countdown to the next occurrence, the weekday it lands on, and the age you will turn — calculated in your own time zone.",
      howItWorks: [
        "The next birthday is built from the birth month and day in the current year. If that date has already passed, the year is incremented. The countdown subtracts the current instant from local midnight on the target date, so the answer respects daylight-saving changes.",
        "February 29 is handled by falling back to March 1 in non-leap years, and the page says so when it applies.",
      ],
      examples: [
        { input: "Born 1990-06-14", output: "counts to 14 June", note: "local midnight" },
        { input: "Born 2000-02-29", output: "1 March in common years", note: "leap-day fallback" },
      ],
      limits:
        "The countdown uses the clock and time zone of the device viewing the page. Two people in different zones can see a different number of hours remaining.",
      faqs: [
        {
          q: "Does it account for time zones?",
          a: "It uses the browser's local time zone, so the target is midnight where you are. It does not convert someone else's birthday into your zone.",
        },
        {
          q: "What happens for a 29 February birthday?",
          a: "In common years the countdown targets 1 March and the page notes the fallback. Leap years use 29 February normally.",
        },
        {
          q: "Is the date saved?",
          a: "Only in your browser's local storage if you choose to keep it. Nothing is sent to a server.",
        },
      ],
    },
    related: ["timezone-buddy", "timestamp-converter", "percentage-calculator"],
    og: { kicker: "Calculators", value: "days to go" },
    status: "live",
    added: "2023-07-15",
    updated: date,
  },
];
