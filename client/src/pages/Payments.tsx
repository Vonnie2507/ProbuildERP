import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, Column, Action } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Search, Download, CreditCard, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  invoiceNumber: string;
  jobNumber: string;
  clientName: string;
  amount: number;
  type: "deposit" | "final" | "refund";
  status: "pending" | "paid" | "overdue";
  dueDate: string;
  paidDate?: string;
}

export default function Payments() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // todo: remove mock functionality
  const payments: Payment[] = [
    { id: "1", invoiceNumber: "INV-2024-0089", jobNumber: "JOB-2024-089", clientName: "Williams Family", amount: 4250, type: "deposit", status: "paid", dueDate: "28 Nov 2024", paidDate: "28 Nov 2024" },
    { id: "2", invoiceNumber: "INV-2024-0091", jobNumber: "JOB-2024-091", clientName: "Harbor Homes", amount: 12250, type: "deposit", status: "paid", dueDate: "25 Nov 2024", paidDate: "25 Nov 2024" },
    { id: "3", invoiceNumber: "INV-2024-0087", jobNumber: "JOB-2024-087", clientName: "Pacific Builders", amount: 3100, type: "final", status: "pending", dueDate: "10 Dec 2024" },
    { id: "4", invoiceNumber: "INV-2024-0085", jobNumber: "JOB-2024-085", clientName: "Johnson Property", amount: 6400, type: "deposit", status: "overdue", dueDate: "1 Dec 2024" },
    { id: "5", invoiceNumber: "INV-2024-0083", jobNumber: "JOB-2024-083", clientName: "Coastal Living", amount: 8500, type: "final", status: "paid", dueDate: "20 Nov 2024", paidDate: "19 Nov 2024" },
    { id: "6", invoiceNumber: "INV-2024-0093", jobNumber: "JOB-2024-093", clientName: "Smith Residence", amount: 5200, type: "deposit", status: "pending", dueDate: "15 Dec 2024" },
  ];

  const totalReceived = payments.filter(p => p.status === "paid").reduce((acc, p) => acc + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((acc, p) => acc + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === "overdue").reduce((acc, p) => acc + p.amount, 0);
  const pendingCount = payments.filter(p => p.status === "pending").length;

  const filteredPayments = payments.filter(
    (payment) =>
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.jobNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Payment>[] = [
    {
      key: "invoiceNumber",
      header: "Invoice",
      sortable: true,
      render: (payment) => (
        <span className="font-mono text-sm">{payment.invoiceNumber}</span>
      ),
    },
    {
      key: "jobNumber",
      header: "Job",
      render: (payment) => (
        <span className="font-mono text-xs text-muted-foreground">{payment.jobNumber}</span>
      ),
    },
    {
      key: "clientName",
      header: "Client",
      sortable: true,
    },
    {
      key: "type",
      header: "Type",
      render: (payment) => (
        <Badge variant="secondary" className="text-[10px] uppercase">
          {payment.type}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (payment) => (
        <span className="font-semibold">${payment.amount.toLocaleString()}</span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (payment) => <StatusBadge status={payment.status as "pending" | "paid" | "overdue"} />,
    },
  ];

  const actions: Action<Payment>[] = [
    {
      label: "View Invoice",
      onClick: (payment) => toast({ title: "Viewing invoice", description: payment.invoiceNumber }),
    },
    {
      label: "Record Payment",
      onClick: (payment) => toast({ title: "Recording payment", description: payment.invoiceNumber }),
    },
    {
      label: "Send Reminder",
      onClick: (payment) => toast({ title: "Sending reminder", description: `Reminder sent for ${payment.invoiceNumber}` }),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-payments-title">Finance & Payments</h1>
          <p className="text-sm text-muted-foreground">
            Track deposits, finals, and payment status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button data-testid="button-record-payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Received (MTD)"
          value={`$${totalReceived.toLocaleString()}`}
          description="This month"
          icon={CheckCircle}
        />
        <StatCard
          title="Pending"
          value={`$${totalPending.toLocaleString()}`}
          description={`${pendingCount} invoices`}
          icon={Clock}
        />
        <StatCard
          title="Overdue"
          value={`$${totalOverdue.toLocaleString()}`}
          description="Needs attention"
          icon={AlertTriangle}
        />
        <StatCard
          title="This Week"
          value="$18,500"
          description="Payments received"
          icon={CreditCard}
        />
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Payment History</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-payments"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all-payments">All</TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending-payments">Pending</TabsTrigger>
              <TabsTrigger value="paid" data-testid="tab-paid-payments">Paid</TabsTrigger>
              <TabsTrigger value="overdue" data-testid="tab-overdue-payments">Overdue</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <DataTable
                data={filteredPayments}
                columns={columns}
                actions={actions}
                onRowClick={(payment) => toast({ title: "Payment selected", description: payment.invoiceNumber })}
                keyExtractor={(payment) => payment.id}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <DataTable
                data={filteredPayments.filter(p => p.status === "pending")}
                columns={columns}
                actions={actions}
                onRowClick={(payment) => toast({ title: "Payment selected", description: payment.invoiceNumber })}
                keyExtractor={(payment) => payment.id}
              />
            </TabsContent>

            <TabsContent value="paid" className="mt-4">
              <DataTable
                data={filteredPayments.filter(p => p.status === "paid")}
                columns={columns}
                actions={actions}
                onRowClick={(payment) => toast({ title: "Payment selected", description: payment.invoiceNumber })}
                keyExtractor={(payment) => payment.id}
              />
            </TabsContent>

            <TabsContent value="overdue" className="mt-4">
              <DataTable
                data={filteredPayments.filter(p => p.status === "overdue")}
                columns={columns}
                actions={actions}
                onRowClick={(payment) => toast({ title: "Payment selected", description: payment.invoiceNumber })}
                keyExtractor={(payment) => payment.id}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
