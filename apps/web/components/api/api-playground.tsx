"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, Clock, Plus, Trash2, Globe, History, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  POST: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PUT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
  PATCH: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

interface ApiResponse {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: any;
  error?: string;
  time?: number;
  size?: string;
}

interface KeyValueItem {
  key: string;
  value: string;
}

interface RequestHistoryItem {
  method: string;
  url: string;
  time: string;
}

export function ApiPlayground() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Key-value headers list
  const [headersList, setHeadersList] = useState<KeyValueItem[]>([
    { key: "Content-Type", value: "application/json" },
  ]);

  // Key-value query parameters list
  const [paramsList, setParamsList] = useState<KeyValueItem[]>([
    { key: "", value: "" },
  ]);

  // Request History
  const [history, setHistory] = useState<RequestHistoryItem[]>([
    { method: "GET", url: "https://jsonplaceholder.typicode.com/posts/1", time: "Just now" },
    { method: "POST", url: "https://jsonplaceholder.typicode.com/posts", time: "10m ago" },
  ]);

  // Construct URL with parameters on submit
  const getFullUrl = () => {
    try {
      const urlObj = new URL(url);
      paramsList.forEach((param) => {
        if (param.key.trim()) {
          urlObj.searchParams.set(param.key.trim(), param.value.trim());
        }
      });
      return urlObj.toString();
    } catch {
      return url; // fallback to user-entered text if not standard URL
    }
  };

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    const startTime = Date.now();
    const finalUrl = getFullUrl();

    // Construct headers object
    const headersObj: Record<string, string> = {};
    headersList.forEach((item) => {
      if (item.key.trim()) {
        headersObj[item.key.trim()] = item.value.trim();
      }
    });

    try {
      const res = await fetch(finalUrl, {
        method,
        headers: headersObj,
        body: method !== "GET" && method !== "HEAD" ? body : undefined,
      });

      const text = await res.text();
      let jsonData: any = null;
      try {
        jsonData = JSON.parse(text);
      } catch {
        jsonData = text;
      }

      const endTime = Date.now();
      const responseSize = (text.length / 1024).toFixed(2) + " KB";

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: jsonData,
        time: endTime - startTime,
        size: responseSize,
      });

      // Add to history
      setHistory((prev) => [
        { method, url: finalUrl, time: "Just now" },
        ...prev.slice(0, 9),
      ]);

      toast.success(`Request completed: ${res.status} ${res.statusText}`);
    } catch (err: any) {
      const endTime = Date.now();
      setResponse({
        error: err.message || "Network request failed",
        time: endTime - startTime,
      });
      toast.error("Network request failed");
    } finally {
      setLoading(false);
    }
  };

  const addHeader = () => setHeadersList([...headersList, { key: "", value: "" }]);
  const removeHeader = (index: number) => setHeadersList(headersList.filter((_, idx) => idx !== index));
  const updateHeader = (index: number, field: "key" | "value", val: string) => {
    const updated = [...headersList];
    updated[index][field] = val;
    setHeadersList(updated);
  };

  const addParam = () => setParamsList([...paramsList, { key: "", value: "" }]);
  const removeParam = (index: number) => setParamsList(paramsList.filter((_, idx) => idx !== index));
  const updateParam = (index: number, field: "key" | "value", val: string) => {
    const updated = [...paramsList];
    updated[index][field] = val;
    setParamsList(updated);
  };

  const populateFromHistory = (item: RequestHistoryItem) => {
    setMethod(item.method);
    try {
      const parsedUrl = new URL(item.url);
      setUrl(parsedUrl.origin + parsedUrl.pathname);
      // Populate params
      const params: KeyValueItem[] = [];
      parsedUrl.searchParams.forEach((value, key) => {
        params.push({ key, value });
      });
      setParamsList(params.length > 0 ? params : [{ key: "", value: "" }]);
    } catch {
      setUrl(item.url);
    }
    toast.success("Loaded request config");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">API Playground</h1>
        <p className="mt-1 text-muted-foreground text-sm">Send REST endpoints and inspect response packages</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        
        {/* Left Side: Request Sidebar / History */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <Card className="glass">
            <CardHeader className="py-4 flex flex-row items-center gap-2 border-b border-border/30">
              <History className="h-4 w-4 text-indigo-400" />
              <CardTitle className="text-sm font-bold">Request Log</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1 divide-y divide-border/20 max-h-[300px] lg:max-h-none overflow-y-auto">
              {history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => populateFromHistory(item)}
                  className="flex flex-col gap-1 w-full text-left p-2.5 rounded hover:bg-secondary/40 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[9px] font-bold px-1 py-0.2 border ${methodColors[item.method]}`}>
                      {item.method}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{item.time}</span>
                  </div>
                  <span className="text-[11px] font-mono text-foreground/80 truncate w-full group-hover:text-indigo-400">
                    {item.url}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Right Side: Primary Playground Chrome */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Method and URL Input Bar */}
          <div className="flex gap-2 bg-secondary/15 p-2 rounded-xl border border-border/30 backdrop-blur-md">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-28 bg-background border-border/40 font-bold focus:ring-1 focus:ring-ring text-xs h-10">
                <SelectValue placeholder="GET" />
              </SelectTrigger>
              <SelectContent className="glass">
                {HTTP_METHODS.map((m) => (
                  <SelectItem key={m} value={m} className="font-semibold text-xs">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter endpoint URL e.g. https://api.fusion.dev/v1/health"
              className="flex-1 bg-background border-border/40 focus:border-indigo-500 font-mono text-xs h-10"
            />

            <Button
              onClick={handleSend}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/10 px-5 gap-1.5 h-10 shrink-0 font-bold text-xs"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Send
            </Button>
          </div>

          {/* Request / Response panels split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Request configuration */}
            <Card className="glass">
              <CardHeader className="py-4 border-b border-border/30">
                <CardTitle className="text-sm font-bold">Request configuration</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Tabs defaultValue="headers" className="space-y-4">
                  <TabsList className="bg-secondary/15 border border-border/30 rounded-lg p-0.5 w-full justify-start">
                    <TabsTrigger value="headers" className="text-xs">Headers</TabsTrigger>
                    <TabsTrigger value="params" className="text-xs">Params</TabsTrigger>
                    <TabsTrigger value="body" className="text-xs" disabled={method === "GET"}>Body</TabsTrigger>
                  </TabsList>

                  {/* Headers Config Tab */}
                  <TabsContent value="headers" className="space-y-3 focus-visible:outline-none">
                    <div className="space-y-2 max-h-[220px] overflow-y-auto">
                      {headersList.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            placeholder="Key"
                            value={item.key}
                            onChange={(e) => updateHeader(idx, "key", e.target.value)}
                            className="bg-secondary/35 border-border/45 text-xs h-8 font-mono"
                          />
                          <Input
                            placeholder="Value"
                            value={item.value}
                            onChange={(e) => updateHeader(idx, "value", e.target.value)}
                            className="bg-secondary/35 border-border/45 text-xs h-8 font-mono"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeHeader(idx)}
                            className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={addHeader} className="h-7 text-xs border-dashed gap-1">
                      <Plus className="h-3.5 w-3.5" /> Add Header
                    </Button>
                  </TabsContent>

                  {/* Query Params Config Tab */}
                  <TabsContent value="params" className="space-y-3 focus-visible:outline-none">
                    <div className="space-y-2 max-h-[220px] overflow-y-auto">
                      {paramsList.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            placeholder="Param Key"
                            value={item.key}
                            onChange={(e) => updateParam(idx, "key", e.target.value)}
                            className="bg-secondary/35 border-border/45 text-xs h-8 font-mono"
                          />
                          <Input
                            placeholder="Param Value"
                            value={item.value}
                            onChange={(e) => updateParam(idx, "value", e.target.value)}
                            className="bg-secondary/35 border-border/45 text-xs h-8 font-mono"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeParam(idx)}
                            className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={addParam} className="h-7 text-xs border-dashed gap-1">
                      <Plus className="h-3.5 w-3.5" /> Add Param
                    </Button>
                  </TabsContent>

                  {/* Payload Body Config Tab */}
                  <TabsContent value="body" className="focus-visible:outline-none">
                    <Textarea
                      placeholder='{\n  "name": "Fusion Project",\n  "status": "active"\n}'
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={8}
                      className="bg-black/45 border-border/40 font-mono text-xs placeholder:text-muted-foreground/40 focus:border-indigo-500"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Response Area */}
            <Card className="glass flex flex-col">
              <CardHeader className="py-4 border-b border-border/30 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-sm font-bold">Response Console</CardTitle>
                
                {/* Stats panel */}
                {response && (
                  <div className="flex items-center gap-3 text-[10px] font-semibold">
                    {response.status && (
                      <span className={response.status < 400 ? "text-emerald-400" : "text-rose-400"}>
                        {response.status} {response.statusText}
                      </span>
                    )}
                    {response.time && (
                      <span className="text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-3 w-3" /> {response.time}ms
                      </span>
                    )}
                    {response.size && (
                      <span className="text-muted-foreground">{response.size}</span>
                    )}
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-4 flex-1 flex flex-col min-h-0">
                <div className="bg-[#090b11] border border-border/30 rounded-lg flex-1 min-h-[250px] overflow-auto p-4 relative">
                  {response ? (
                    response.error ? (
                      <pre className="font-mono text-xs text-rose-400 whitespace-pre-wrap leading-relaxed">
                        {response.error}
                      </pre>
                    ) : (
                      <pre className="font-mono text-xs text-indigo-300 whitespace-pre-wrap leading-relaxed selection:bg-indigo-500/25">
                        {JSON.stringify(response.data, null, 2)}
                      </pre>
                    )
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/35 border border-border/40 text-muted-foreground">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground/80">Console Idle</p>
                        <p className="text-[10px] text-muted-foreground">Trigger a REST request to output body data here.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
