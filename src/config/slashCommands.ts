import {
  BarChart3,
  Bug,
  FileText,
  Languages,
  Scan,
  Sparkles,
  Wrench,
} from "lucide-react";

export interface SlashCommand {
  trigger: string;
  label: string;
  description: string;
  icon: typeof Scan;
  template?: string;
  instant?: boolean;
  instantPrompt?: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    trigger: "/scan",
    label: "Security Scan",
    description: "Structured assessment for a target",
    icon: Scan,
    template:
      "Perform a structured security assessment for the following target. Include scope, methodology, likely findings by severity, and remediation steps:\n\n",
  },
  {
    trigger: "/explain",
    label: "Explain Code",
    description: "Detailed explanation of code",
    icon: Sparkles,
    template:
      "Explain the following code in detail — purpose, flow, edge cases, and security implications:\n\n",
  },
  {
    trigger: "/fix",
    label: "Fix Code",
    description: "Fix bugs and explain what was wrong",
    icon: Wrench,
    template:
      "Fix the following code. Explain what was wrong and why the fix works:\n\n",
  },
  {
    trigger: "/report",
    label: "Security Report",
    description: "Formatted report with findings",
    icon: FileText,
    template:
      "Generate a formal security report with sections: Summary, Scope, Findings (by severity), Risk Rating, Remediation, and References for:\n\n",
  },
  {
    trigger: "/bugs",
    label: "Find Bugs",
    description: "Scan code for bugs and code smells",
    icon: Bug,
    template:
      "Review the following code for bugs, edge cases, and code smells. List each issue with line-level detail:\n\n",
  },
  {
    trigger: "/hindi",
    label: "Reply in Hinglish",
    description: "Force response in Hindi + English",
    icon: Languages,
    template:
      "Reply in simple Hinglish (Hindi + English mix) for the following:\n\n",
  },
  {
    trigger: "/summarize",
    label: "Summarize Chat",
    description: "Summarize this conversation",
    icon: BarChart3,
    instant: true,
    instantPrompt:
      "Summarize this conversation so far in 5 concise bullet points.",
  },
];

export function filterCommands(query: string): SlashCommand[] {
  const q = query.toLowerCase();
  return SLASH_COMMANDS.filter((c) =>
    c.trigger.slice(1).toLowerCase().startsWith(q)
  );
}