"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2 } from "lucide-react";

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

interface ApiResponse {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: any;
  error?: string;
  time?: number;
}

export function ApiPlayground() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [headers, setHeaders] = useState<Record<string, string>>({
    "Content-Type": "application/json",
  });
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: method !== "GET" && method !== "HEAD" ? body : undefined,
      });
      
      const data = await res.json().catch(() => null);
      const time = Date.now() - startTime;
      
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data,
        time,
      });
    } catch (error) {
      setResponse({
        error: String(error),
        time: Date.now() - startTime,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">API Playground</h1>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2 mb-4">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="https://api.example.com/endpoint"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={sendRequest} disabled={loading || !url}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="body">
              <TabsList>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
              </TabsList>
              <TabsContent value="body">
                <Textarea
                  placeholder="Request body (JSON)"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="headers">
                <div className="space-y-2">
                  {Object.entries(headers).map(([key, value], i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder="Header name"
                        value={key}
                        onChange={(e) => {
                          const newHeaders = { ...headers };
                          delete newHeaders[key];
                          newHeaders[e.target.value] = value;
                          setHeaders(newHeaders);
                        }}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Header value"
                        value={value}
                        onChange={(e) => {
                          setHeaders({ ...headers, [key]: e.target.value });
                        }}
                        className="flex-1"
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHeaders({ ...headers, "": "" })}
                  >
                    Add Header
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Response</CardTitle>
            {response && (
              <div className="flex items-center gap-2 text-sm">
                {response.status && (
                  <span className={`font-mono ${response.status < 400 ? "text-green-500" : "text-red-500"}`}>
                    {response.status} {response.statusText}
                  </span>
                )}
                {response.time && (
                  <span className="text-muted-foreground">{response.time}ms</span>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg min-h-[300px] overflow-auto">
              {response ? (
                response.error ? (
                  <pre className="font-mono text-sm text-red-500 whitespace-pre-wrap">
                    {response.error}
                  </pre>
                ) : (
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                )
              ) : (
                <p className="text-muted-foreground">Send a request to see the response</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
