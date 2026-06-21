"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/apiClient";
import { useCurrentUser } from "@/features/dashboard/use-current-user";

interface ApiKeyStatus {
  hasApiKey: boolean;
  tokenUsage: number;
  aiSuggestionEnabled: boolean;
}

const loadApiKeyStatus = async (companyId: string) => {
  const res = await apiClient.get<ApiKeyStatus>(
    `/companies/${companyId}/api-key`,
  );
  return res.data;
};

export default function CompanySettingsPage() {
  const { user } = useCurrentUser();
  const companyId = user?.companyId || user?.company?.id;
  const [status, setStatus] = useState<ApiKeyStatus | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchStatus = async () => {
    if (!companyId) return;
    setStatus(await loadApiKeyStatus(companyId));
  };

  useEffect(() => {
    if (!companyId) return;

    let isMounted = true;
    loadApiKeyStatus(companyId).then((data) => {
      if (isMounted) setStatus(data);
    });

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const saveApiKey = async () => {
    if (!companyId || !apiKey.trim()) return;
    setIsSaving(true);
    try {
      await apiClient.patch(`/companies/${companyId}/api-key`, { apiKey });
      toast.success("API key updated");
      setApiKey("");
      fetchStatus();
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAi = async () => {
    if (!companyId || !status) return;
    await apiClient.patch(`/companies/${companyId}/settings`, {
      aiSuggestionEnabled: !status.aiSuggestionEnabled,
    });
    toast.success("AI suggestion setting updated");
    fetchStatus();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Company Settings</h1>
        <p className="text-muted-foreground">
          Manage BYOK, token usage, and AI assistant availability.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {(status?.tokenUsage ?? 0).toLocaleString()} tokens
          </div>
          <p className="text-sm text-muted-foreground">
            Self-managed usage meter. No hard limit is enforced.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Status: {status?.hasApiKey ? "Company key configured" : "Using global fallback key"}
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Paste Gemini API key"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
            <Button onClick={saveApiKey} disabled={isSaving}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">
              {status?.aiSuggestionEnabled ? "Enabled" : "Disabled"}
            </div>
            <p className="text-sm text-muted-foreground">
              Controls `/ai/suggestion` and `/ai/quick-edit`.
            </p>
          </div>
          <Button variant="outline" onClick={toggleAi}>
            {status?.aiSuggestionEnabled ? "Disable" : "Enable"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
