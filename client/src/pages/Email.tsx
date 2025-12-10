import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Send,
  Clock,
  CheckCircle,
  Search,
  Loader2,
  Link2,
  Building2,
  FileText,
  Briefcase,
  Inbox,
  Plus,
  Settings,
  RefreshCw,
  MailCheck,
  MailX,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface EmailAccount {
  id: string;
  name: string;
  emailAddress: string;
  accountType: string;
  isActive: boolean;
  signature: string | null;
  lastSyncAt: string | null;
  createdAt: string;
}

interface EmailThread {
  id: string;
  accountId: string;
  subject: string;
  participantEmails: string[];
  clientId: string | null;
  leadId: string | null;
  jobId: string | null;
  quoteId: string | null;
  assignedTo: string | null;
  isResolved: boolean;
  resolvedAt: string | null;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
  messages?: Email[];
}

interface Email {
  id: string;
  threadId: string;
  accountId: string;
  fromEmail: string;
  fromName: string | null;
  toEmails: string[];
  ccEmails: string[] | null;
  subject: string;
  bodyHtml: string | null;
  bodyText: string | null;
  status: string;
  isOutbound: boolean;
  isRead: boolean;
  sentAt: string | null;
  receivedAt: string | null;
  createdAt: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  category: string | null;
  accountType: string | null;
}

function EmailAccountSetup() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    emailAddress: "",
    accountType: "team",
    sendgridApiKey: "",
    signature: "",
  });

  const { data: accounts = [], isLoading } = useQuery<EmailAccount[]>({
    queryKey: ["/api/email/accounts"],
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: typeof newAccount) => {
      const response = await apiRequest("POST", "/api/email/accounts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Email account added" });
      queryClient.invalidateQueries({ queryKey: ["/api/email/accounts"] });
      setShowAddDialog(false);
      setNewAccount({ name: "", emailAddress: "", accountType: "team", sendgridApiKey: "", signature: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add account", description: error.message, variant: "destructive" });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/email/accounts/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Account deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/email/accounts"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Email Accounts</h3>
          <p className="text-sm text-muted-foreground">Configure email accounts for sending and receiving</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No email accounts configured</p>
            <p className="text-sm">Add your first email account to start sending emails</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`${
                        account.accountType === 'team' ? 'bg-blue-100 text-blue-700' :
                        account.accountType === 'accounts' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        <Mail className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{account.name}</p>
                        <Badge variant="outline" className="capitalize">{account.accountType}</Badge>
                        {account.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{account.emailAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteAccountMutation.mutate(account.id)}
                    >
                      <MailX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Email Account</DialogTitle>
            <DialogDescription>
              Configure a new email account for sending and receiving messages
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Account Name</Label>
              <Input
                placeholder="e.g., Team Email, Accounts"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="team@probuildpvc.com.au"
                value={newAccount.emailAddress}
                onChange={(e) => setNewAccount({ ...newAccount, emailAddress: e.target.value })}
              />
            </div>

            <div>
              <Label>Account Type</Label>
              <Select
                value={newAccount.accountType}
                onValueChange={(value) => setNewAccount({ ...newAccount, accountType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team">Team (General Communications)</SelectItem>
                  <SelectItem value="accounts">Accounts (Finance/Invoices)</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>SendGrid API Key (Optional)</Label>
              <Input
                type="password"
                placeholder="SG.xxx..."
                value={newAccount.sendgridApiKey}
                onChange={(e) => setNewAccount({ ...newAccount, sendgridApiKey: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Required for sending emails. Get one from sendgrid.com
              </p>
            </div>

            <div>
              <Label>Email Signature</Label>
              <Textarea
                placeholder="Regards,&#10;Probuild PVC Team"
                value={newAccount.signature}
                onChange={(e) => setNewAccount({ ...newAccount, signature: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createAccountMutation.mutate(newAccount)}
              disabled={!newAccount.name || !newAccount.emailAddress || createAccountMutation.isPending}
            >
              {createAccountMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Add Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmailInbox() {
  const { toast } = useToast();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [newEmail, setNewEmail] = useState({
    accountId: "",
    to: "",
    subject: "",
    bodyHtml: "",
  });

  const { data: accounts = [] } = useQuery<EmailAccount[]>({
    queryKey: ["/api/email/accounts"],
  });

  const { data: threads = [], isLoading: threadsLoading } = useQuery<EmailThread[]>({
    queryKey: ["/api/email/threads", { resolved: showResolved }],
  });

  const { data: threadDetails } = useQuery<EmailThread>({
    queryKey: ["/api/email/threads", selectedThread],
    enabled: !!selectedThread,
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: typeof newEmail) => {
      const response = await apiRequest("POST", "/api/email/send", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Email sent" });
      queryClient.invalidateQueries({ queryKey: ["/api/email/threads"] });
      setShowComposeDialog(false);
      setNewEmail({ accountId: "", to: "", subject: "", bodyHtml: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send email", description: error.message, variant: "destructive" });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      return apiRequest("POST", `/api/email/threads/${threadId}/mark-read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/threads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/email/unread-count"] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ threadId, resolved }: { threadId: string; resolved: boolean }) => {
      return apiRequest("POST", `/api/email/threads/${threadId}/resolve`, { resolved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/threads"] });
    },
  });

  const filteredThreads = threads.filter((thread) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        thread.subject.toLowerCase().includes(query) ||
        thread.participantEmails?.some((e) => e.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Thread List */}
      <div className="w-1/3 flex flex-col">
        <div className="space-y-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setShowComposeDialog(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-resolved"
                checked={showResolved}
                onCheckedChange={setShowResolved}
              />
              <Label htmlFor="show-resolved" className="text-sm">Show resolved</Label>
            </div>
            <Button variant="ghost" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/email/threads"] })}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {threadsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No email threads</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedThread === thread.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    setSelectedThread(thread.id);
                    if (thread.unreadCount > 0) {
                      markReadMutation.mutate(thread.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${thread.unreadCount > 0 ? 'font-bold' : ''}`}>
                          {thread.participantEmails?.[0] || 'Unknown'}
                        </span>
                        {thread.unreadCount > 0 && (
                          <Badge variant="default" className="h-5 min-w-[20px] px-1.5">
                            {thread.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm truncate ${
                        selectedThread === thread.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        {thread.subject}
                      </p>
                    </div>
                    <span className={`text-xs whitespace-nowrap ${
                      selectedThread === thread.id ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    }`}>
                      {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
                    </span>
                  </div>
                  {thread.isResolved && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolved
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Email View */}
      <Card className="flex-1 flex flex-col">
        {!selectedThread ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select an email thread to view</p>
            </div>
          </div>
        ) : !threadDetails ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{threadDetails.subject}</CardTitle>
                  <CardDescription>
                    {threadDetails.participantEmails?.join(", ")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resolveMutation.mutate({
                      threadId: threadDetails.id,
                      resolved: !threadDetails.isResolved
                    })}
                  >
                    {threadDetails.isResolved ? (
                      <>
                        <MailX className="h-4 w-4 mr-2" />
                        Unresolve
                      </>
                    ) : (
                      <>
                        <MailCheck className="h-4 w-4 mr-2" />
                        Resolve
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-4">
              {threadDetails.messages?.map((email) => (
                <div
                  key={email.id}
                  className={`mb-4 p-4 rounded-lg ${
                    email.isOutbound ? "bg-primary/10 ml-8" : "bg-muted mr-8"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {email.fromName?.[0] || email.fromEmail[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{email.fromName || email.fromEmail}</p>
                        <p className="text-xs text-muted-foreground">
                          To: {email.toEmails?.join(", ")}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {email.sentAt ? format(new Date(email.sentAt), "MMM d, h:mm a") :
                       email.createdAt ? format(new Date(email.createdAt), "MMM d, h:mm a") : ""}
                    </span>
                  </div>
                  <div
                    className="text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: email.bodyHtml || email.bodyText || "" }}
                  />
                </div>
              ))}
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Write your reply..."
                  className="min-h-[80px]"
                />
                <Button className="self-end">
                  <Send className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Compose Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>From Account</Label>
              <Select
                value={newEmail.accountId}
                onValueChange={(value) => setNewEmail({ ...newEmail, accountId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select email account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.emailAddress})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>To</Label>
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={newEmail.to}
                onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
              />
            </div>

            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Email subject"
                value={newEmail.subject}
                onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                placeholder="Write your message..."
                value={newEmail.bodyHtml}
                onChange={(e) => setNewEmail({ ...newEmail, bodyHtml: e.target.value })}
                rows={10}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => sendEmailMutation.mutate(newEmail)}
              disabled={!newEmail.accountId || !newEmail.to || !newEmail.subject || sendEmailMutation.isPending}
            >
              {sendEmailMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Email() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Email</h1>
        <p className="text-muted-foreground">
          Send and receive emails with clients and team members
        </p>
      </div>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList>
          <TabsTrigger value="inbox">
            <Inbox className="h-4 w-4 mr-2" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-6">
          <EmailInbox />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <EmailAccountSetup />
        </TabsContent>
      </Tabs>
    </div>
  );
}
