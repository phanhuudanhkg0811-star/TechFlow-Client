"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Spinner } from "@/components/ui/spinner";
import {
  IconBriefcase,
  IconMail,
  IconPlus,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import apiClient from "@/lib/apiClient";
import TriggerPipelineButton from "@/features/dashboard-detail/components/trigger-button";

type Difficulty = "Intern" | "Junior" | "Mid-level" | "Senior";

interface EmailAccount {
  id: string;
  email: string;
  isActive: boolean;
}

interface Template {
  id: string;
  name: string;
  templateType: string;
  isPublic: boolean;
}

interface ScenarioForm {
  id?: string;
  title: string;
  difficulty: Difficulty;
  timeLimit: number;
  context: string;
  templateId?: string;
  isDefault: boolean;
}

interface Job {
  id: string;
  title: string;
  content?: string;
  jobReference?: string | null;
  emailAccountId?: string | null;
  emailAccount?: { id: string; email: string } | null;
  scenarios?: ScenarioForm[];
  _count?: { applications: number };
}

const blankScenario = (isDefault = false): ScenarioForm => ({
  title: "",
  difficulty: "Junior",
  timeLimit: 90,
  context: "",
  isDefault,
});

export default function JobsManagement() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [jobReference, setJobReference] = useState("");
  const [emailAccountId, setEmailAccountId] = useState("");
  const [scenarios, setScenarios] = useState<ScenarioForm[]>([
    blankScenario(true),
  ]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, emailRes, templateRes] = await Promise.all([
        apiClient.get<Job[]>("/jobs"),
        apiClient.get<EmailAccount[]>("/email-accounts"),
        apiClient.get<Template[]>("/templates"),
      ]);
      setJobs(jobsRes.data);
      setEmailAccounts(emailRes.data.filter((account) => account.isActive));
      setTemplates(templateRes.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setJobReference("");
    setEmailAccountId("");
    setScenarios([blankScenario(true)]);
  };

  const editJob = (job: Job) => {
    setEditingId(job.id);
    setTitle(job.title || "");
    setContent(job.content || "");
    setJobReference(job.jobReference || "");
    setEmailAccountId(job.emailAccountId || job.emailAccount?.id || "");
    setScenarios(
      job.scenarios?.length
        ? job.scenarios.map((scenario, index) => ({
            id: scenario.id,
            title: scenario.title,
            difficulty: scenario.difficulty,
            timeLimit: scenario.timeLimit,
            context: scenario.context,
            templateId: scenario.templateId,
            isDefault: scenario.isDefault || index === 0,
          }))
        : [blankScenario(true)],
    );
  };

  const updateScenario = (
    index: number,
    patch: Partial<ScenarioForm>,
  ) => {
    setScenarios((current) =>
      current.map((scenario, itemIndex) =>
        itemIndex === index ? { ...scenario, ...patch } : scenario,
      ),
    );
  };

  const setDefaultScenario = (index: number) => {
    setScenarios((current) =>
      current.map((scenario, itemIndex) => ({
        ...scenario,
        isDefault: itemIndex === index,
      })),
    );
  };

  const removeScenario = (index: number) => {
    setScenarios((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      if (!next.some((scenario) => scenario.isDefault) && next[0]) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next.length ? next : [blankScenario(true)];
    });
  };

  const submitJob = async () => {
    const firstScenario = scenarios[0];
    if (!title.trim() || !content.trim() || !firstScenario) {
      toast.error("Job title, JD, and at least one test are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedScenarios = scenarios.map((scenario, index) => ({
        ...scenario,
        templateId:
          scenario.templateId && scenario.templateId !== "none"
            ? scenario.templateId
            : undefined,
        isDefault: scenario.isDefault || index === 0,
      }));

      const payload = {
        title,
        content,
        jobReference: jobReference || undefined,
        emailAccountId: emailAccountId || undefined,
        scenarios: normalizedScenarios,
        scenarioTitle: firstScenario.title,
        difficulty: firstScenario.difficulty,
        timeLimit: firstScenario.timeLimit,
        scenarioContext: firstScenario.context,
      };

      if (editingId) {
        await apiClient.patch(`/jobs/${editingId}`, payload);
        toast.success("Job updated");
      } else {
        await apiClient.post("/jobs", payload);
        toast.success("Job created");
      }

      resetForm();
      fetchData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteJob = async (id: string) => {
    await apiClient.delete(`/jobs/${id}`);
    toast.success("Job deleted");
    fetchData();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs & Tests</h1>
          <p className="text-muted-foreground">
            Create jobs, attach an IMAP account, and configure multiple tests.
          </p>
        </div>
        <TriggerPipelineButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Job" : "Create Job"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Job title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Input
              placeholder="Job reference, e.g. FE-2026"
              value={jobReference}
              onChange={(event) => setJobReference(event.target.value)}
            />
          </div>

          <Select value={emailAccountId} onValueChange={setEmailAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Select CV inbox" />
            </SelectTrigger>
            <SelectContent>
              {emailAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            className="min-h-32"
            placeholder="Paste full job description..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tests</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setScenarios((current) => [...current, blankScenario()])}
              >
                <IconPlus size={16} /> Add Test
              </Button>
            </div>

            {scenarios.map((scenario, index) => (
              <Card key={index} className="border-muted-foreground/20">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        checked={scenario.isDefault}
                        onChange={() => setDefaultScenario(index)}
                      />
                      Default test
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeScenario(index)}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>

                  <Input
                    placeholder="Test title"
                    value={scenario.title}
                    onChange={(event) =>
                      updateScenario(index, { title: event.target.value })
                    }
                  />

                  <div className="grid gap-3 md:grid-cols-3">
                    <Select
                      value={scenario.difficulty}
                      onValueChange={(value) =>
                        updateScenario(index, { difficulty: value as Difficulty })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Intern">Intern</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Mid-level">Mid-level</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={10}
                      value={scenario.timeLimit}
                      onChange={(event) =>
                        updateScenario(index, {
                          timeLimit: Number(event.target.value),
                        })
                      }
                    />
                    <Select
                      value={scenario.templateId || "none"}
                      onValueChange={(value) =>
                        updateScenario(index, {
                          templateId: value === "none" ? undefined : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No template</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.templateType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Textarea
                    className="min-h-28"
                    placeholder="Test context and requirements..."
                    value={scenario.context}
                    onChange={(event) =>
                      updateScenario(index, { context: event.target.value })
                    }
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
            <Button onClick={submitJob} disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="mr-2 size-4" /> : null}
              {editingId ? "Update Job" : "Create Job"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner className="size-8" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-3 text-lg">
                  <span>{job.title}</span>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {job._count?.applications ?? 0} candidates
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconMail size={16} />
                  {job.emailAccount?.email || "No inbox selected"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconBriefcase size={16} />
                  {job.scenarios?.length ?? 0} test(s)
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => editJob(job)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/jobs/${job.id}/candidates`}>
                      <IconUsers size={16} /> Candidates
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteJob(job.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
