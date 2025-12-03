import { LeadCard } from "@/components/leads/LeadCard";

export default function LeadCardExample() {
  const lead = {
    id: "lead-001",
    clientName: "Sarah Mitchell",
    phone: "0412 345 678",
    email: "sarah.mitchell@email.com",
    address: "42 Ocean Drive, Scarborough WA 6019",
    source: "Website",
    fenceStyle: "Hampton Style - 1.8m height",
    leadType: "public" as const,
    status: "new" as const,
    assignedTo: {
      name: "Dave",
      initials: "DV",
    },
    createdAt: "2h ago",
  };

  return (
    <div className="p-4 max-w-sm">
      <LeadCard
        lead={lead}
        onClick={() => console.log("Lead clicked")}
        onConvertToQuote={() => console.log("Convert to quote")}
        onAddNote={() => console.log("Add note")}
        onFollowUp={() => console.log("Follow up")}
      />
    </div>
  );
}
