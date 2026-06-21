"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/apiClient";
import { useCurrentUser } from "./use-current-user";

type TemplateType = "BASIC_JS" | "NEXTJS" | "REACT_VITE" | "BLANK_CUSTOM";

interface Template {
  id: string;
  name: string;
  description?: string | null;
  templateType: TemplateType;
  initialCode: unknown;
  isPublic: boolean;
  companyId?: string | null;
  _count?: { scenarios: number };
}

const loadTemplates = async () => {
  const res = await apiClient.get<Template[]>("/templates");
  return res.data;
};

export function TemplateManager({ mode }: { mode: "admin" | "company" }) {
  const { user } = useCurrentUser();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateType, setTemplateType] = useState<TemplateType>("BASIC_JS");
  const [initialCode, setInitialCode] = useState(
    '{\n  "index.js": { "file": { "contents": "console.log(\\"hello\\");\\n" } }\n}',
  );

  const fetchTemplates = async () => {
    const data = await loadTemplates();
    setTemplates(
      mode === "admin"
        ? data.filter((template) => template.isPublic)
        : data.filter((template) => !template.isPublic),
    );
  };

  useEffect(() => {
    let isMounted = true;
    loadTemplates().then((data) => {
      if (!isMounted) return;
      setTemplates(
        mode === "admin"
          ? data.filter((template) => template.isPublic)
          : data.filter((template) => !template.isPublic),
      );
    });

    return () => {
      isMounted = false;
    };
  }, [mode]);

  const createTemplate = async () => {
    let parsedInitialCode: unknown;
    try {
      parsedInitialCode = JSON.parse(initialCode);
    } catch {
      toast.error("Initial code must be valid JSON");
      return;
    }

    const payload = {
      name,
      description: description || undefined,
      templateType,
      initialCode: parsedInitialCode,
    };

    if (mode === "admin") {
      await apiClient.post("/admin/templates", payload);
    } else {
      const companyId = user?.companyId || user?.company?.id;
      if (!companyId) return;
      await apiClient.post(`/companies/${companyId}/templates`, payload);
    }

    toast.success("Template created");
    setName("");
    setDescription("");
    fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    await apiClient.delete(`/templates/${id}`);
    toast.success("Template deleted");
    fetchTemplates();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {mode === "admin" ? "Public Templates" : "Company Templates"}
        </h1>
        <p className="text-muted-foreground">
          Create reusable Web-IDE starter files for test scenarios.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Template name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              placeholder="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <Select
              value={templateType}
              onValueChange={(value) => setTemplateType(value as TemplateType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BASIC_JS">Basic JS</SelectItem>
                <SelectItem value="NEXTJS">Next.js</SelectItem>
                <SelectItem value="REACT_VITE">React + Vite</SelectItem>
                <SelectItem value="BLANK_CUSTOM">Blank Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            className="min-h-44 font-mono text-xs"
            value={initialCode}
            onChange={(event) => setInitialCode(event.target.value)}
          />
          <Button onClick={createTemplate}>Create</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-base">
                <span>{template.name}</span>
                <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {template.templateType}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {template.description || "No description"}
              </p>
              <p className="text-xs text-muted-foreground">
                Used by {template._count?.scenarios ?? 0} scenarios
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteTemplate(template.id)}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
