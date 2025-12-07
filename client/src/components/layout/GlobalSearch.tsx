import { useState, useEffect, useRef } from "react";
import { Search, User, FileText, Briefcase, ClipboardList, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { Client, Lead, Job, Quote } from "@shared/schema";

interface SearchResults {
  clients: Client[];
  leads: Lead[];
  jobs: Job[];
  quotes: Quote[];
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (response.ok) {
            const data = await response.json();
            setResults(data);
            setIsOpen(true);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults(null);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  const handleResultClick = (type: string, id: string) => {
    setIsOpen(false);
    setQuery("");
    switch (type) {
      case "client":
        setLocation(`/clients?id=${id}`);
        break;
      case "lead":
        setLocation(`/leads?id=${id}`);
        break;
      case "job":
        setLocation(`/jobs?id=${id}`);
        break;
      case "quote":
        setLocation(`/leads?quote=${id}`);
        break;
    }
  };

  const hasResults = results && (
    results.clients.length > 0 ||
    results.leads.length > 0 ||
    results.jobs.length > 0 ||
    results.quotes.length > 0
  );

  const noResults = results && !hasResults;

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search jobs, clients, quotes..."
          className="pl-9 pr-9 w-full"
          data-testid="input-global-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setIsOpen(true)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
        )}
        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery("");
              setResults(null);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-[400px] overflow-auto">
          {noResults && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No results found for "{query}"
            </div>
          )}

          {hasResults && (
            <div className="py-2">
              {results.clients.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Clients
                  </div>
                  {results.clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => handleResultClick("client", client.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-left hover-elevate",
                        "focus:outline-none focus:bg-accent"
                      )}
                      data-testid={`search-result-client-${client.id}`}
                    >
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{client.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {client.email || client.phone}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {client.clientType}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.leads.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Leads
                  </div>
                  {results.leads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => handleResultClick("lead", lead.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-left hover-elevate",
                        "focus:outline-none focus:bg-accent"
                      )}
                      data-testid={`search-result-lead-${lead.id}`}
                    >
                      <ClipboardList className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{lead.description || lead.siteAddress}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lead.siteAddress}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {lead.stage?.replace("_", " ")}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.jobs.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Jobs
                  </div>
                  {results.jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => handleResultClick("job", job.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-left hover-elevate",
                        "focus:outline-none focus:bg-accent"
                      )}
                      data-testid={`search-result-job-${job.id}`}
                    >
                      <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate font-mono">{job.jobNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {job.siteAddress}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {job.status?.replace(/_/g, " ")}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.quotes.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Quotes
                  </div>
                  {results.quotes.map((quote) => (
                    <button
                      key={quote.id}
                      onClick={() => handleResultClick("quote", quote.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-left hover-elevate",
                        "focus:outline-none focus:bg-accent"
                      )}
                      data-testid={`search-result-quote-${quote.id}`}
                    >
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate font-mono">{quote.quoteNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {quote.siteAddress}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ${parseFloat(quote.totalAmount).toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
