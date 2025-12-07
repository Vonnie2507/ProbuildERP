import { ClientCard } from "@/components/clients/ClientCard";

export default function ClientCardExample() {
  const client = {
    id: "client-001",
    name: "Pacific Builders Pty Ltd",
    phone: "08 9123 4567",
    email: "orders@pacificbuilders.com.au",
    address: "15 Industrial Way, Malaga WA 6090",
    clientType: "trade" as const,
    tradeDiscountLevel: 15,
    totalQuotes: 24,
    totalJobs: 18,
    totalSpent: 156000,
  };

  return (
    <div className="p-4 max-w-sm">
      <ClientCard
        client={client}
        onClick={() => console.log("Client clicked")}
        onCreateQuote={() => console.log("Create quote")}
        onAddNote={() => console.log("Add note")}
        onViewHistory={() => console.log("View history")}
      />
    </div>
  );
}
