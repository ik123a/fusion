"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, CheckCircle, XCircle, Clock, Plus } from "lucide-react";

const deployments = [
  {
    id: "1",
    name: "fusion-web-production",
    status: "success",
    environment: "production",
    url: "https://fusion.app.example.com",
    createdAt: new Date("2024-03-20"),
  },
  {
    id: "2",
    name: "fusion-web-staging",
    status: "success",
    environment: "staging",
    url: "https://staging.fusion.app.example.com",
    createdAt: new Date("2024-03-19"),
  },
  {
    id: "3",
    name: "fusion-api-production",
    status: "failed",
    environment: "production",
    url: "https://api.fusion.app.example.com",
    createdAt: new Date("2024-03-18"),
  },
];

const statusColors = {
  success: "bg-green-500",
  failed: "bg-red-500",
  pending: "bg-yellow-500",
};

export default function DeploymentsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Deployments</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Deployment
        </Button>
      </div>

      <div className="grid gap-4">
        {deployments.map((deployment) => (
          <Card key={deployment.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${statusColors[deployment.status as keyof typeof statusColors]}`} />
                <div>
                  <CardTitle className="text-lg">{deployment.name}</CardTitle>
                  <CardDescription>{deployment.url}</CardDescription>
                </div>
              </div>
              <Badge variant={deployment.status === "success" ? "default" : "destructive"}>
                {deployment.status}
              </Badge>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="capitalize">{deployment.environment}</span>
                <span>{new Date(deployment.createdAt).toLocaleDateString()}</span>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
