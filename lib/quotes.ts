export interface Quote {
  text: string;
  leader: string;
  country: string;
}

export const monitoringQuotes: Quote[] = [
  {
    text: "We are closely monitoring the situation and remain in contact with our allies.",
    leader: "Joe Biden",
    country: "United States"
  },
  {
    text: "France is monitoring the situation with the utmost attention.",
    leader: "Emmanuel Macron",
    country: "France"
  },
  {
    text: "We continue to monitor developments and stand ready to respond.",
    leader: "Rishi Sunak",
    country: "United Kingdom"
  },
  {
    text: "Germany is following the situation very closely.",
    leader: "Olaf Scholz",
    country: "Germany"
  },
  {
    text: "We are watching the situation carefully and coordinating with partners.",
    leader: "Justin Trudeau",
    country: "Canada"
  },
  {
    text: "The situation is being monitored around the clock.",
    leader: "Jens Stoltenberg",
    country: "NATO"
  },
  {
    text: "We are monitoring... always monitoring.",
    leader: "State Department",
    country: "United States"
  },
  {
    text: "Our intelligence services continue to monitor all developments.",
    leader: "MI6 Spokesperson",
    country: "United Kingdom"
  },
  {
    text: "We express deep concern and are monitoring the situation.",
    leader: "UN Secretary General",
    country: "United Nations"
  },
  {
    text: "The Pentagon is monitoring the situation 24/7.",
    leader: "Department of Defense",
    country: "United States"
  },
  {
    text: "We remain vigilant and continue to assess the evolving situation.",
    leader: "NSC Spokesperson",
    country: "United States"
  },
  {
    text: "Australia is closely monitoring events and stands with our allies.",
    leader: "Anthony Albanese",
    country: "Australia"
  },
];

export function getRandomQuote(): Quote {
  return monitoringQuotes[Math.floor(Math.random() * monitoringQuotes.length)];
}
