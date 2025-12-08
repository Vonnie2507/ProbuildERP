import { useState, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Receipt, 
  Camera, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  X,
  DollarSign,
  Calendar,
  Store,
  Tag,
} from "lucide-react";
import { format } from "date-fns";

interface ReceiptLinkData {
  id: string;
  status: string;
  expectedAmount: string | null;
  notes: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export default function SubmitReceipt() {
  const { token } = useParams<{ token: string }>();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: linkData, isLoading: linkLoading, error: linkError } = useQuery<ReceiptLinkData>({
    queryKey: ["/api/receipts/validate", token],
    enabled: !!token,
  });

  const { data: categories = [] } = useQuery<ExpenseCategory[]>({
    queryKey: ["/api/expense-categories"],
  });

  const activeCategories = categories.filter(c => c.isActive);

  const submitMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/receipts/submit/${token}`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit receipt");
      }
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("amount", amount);
    formData.append("merchantName", merchantName);
    formData.append("purchaseDate", purchaseDate);
    formData.append("notes", notes);
    if (categoryId) {
      formData.append("categoryId", categoryId);
    }

    submitMutation.mutate(formData);
  };

  if (linkLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (linkError || !linkData) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-bold text-destructive">Invalid or Expired Link</h2>
              <p className="text-muted-foreground mt-2">
                This receipt submission link is no longer valid. Please contact your admin for a new link.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (linkData.status !== "pending") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h2 className="text-xl font-bold">Receipt Already Submitted</h2>
              <p className="text-muted-foreground mt-2">
                A receipt has already been submitted for this link.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-green-600">Receipt Submitted!</h2>
              <p className="text-muted-foreground mt-2">
                Thank you for submitting your receipt. Your admin will review it shortly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Receipt className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Submit Receipt</CardTitle>
          <CardDescription>
            Upload a photo of your receipt
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {linkData.notes && (
              <Alert>
                <Tag className="h-4 w-4" />
                <AlertTitle>Description</AlertTitle>
                <AlertDescription>{linkData.notes}</AlertDescription>
              </Alert>
            )}

            {linkData.expectedAmount && (
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertTitle>Expected Amount</AlertTitle>
                <AlertDescription>${parseFloat(linkData.expectedAmount).toFixed(2)}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Receipt Photo</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
                data-testid="input-receipt-image"
              />
              
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                    data-testid="button-remove-image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover-elevate transition-colors"
                  data-testid="upload-area"
                >
                  <Camera className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">Tap to take photo</p>
                  <p className="text-sm text-muted-foreground">or upload from gallery</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                data-testid="input-amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchantName">
                <Store className="h-4 w-4 inline mr-1" />
                Merchant / Store
              </Label>
              <Input
                id="merchantName"
                placeholder="e.g., Shell, Bunnings"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                required
                data-testid="input-merchant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">
                <Calendar className="h-4 w-4 inline mr-1" />
                Purchase Date
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
                data-testid="input-date"
              />
            </div>

            {activeCategories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="category">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Category
                </Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this expense..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                data-testid="input-notes"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!selectedImage || submitMutation.isPending}
              data-testid="button-submit-receipt"
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Submit Receipt
            </Button>

            {submitMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {submitMutation.error?.message || "Failed to submit receipt. Please try again."}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
