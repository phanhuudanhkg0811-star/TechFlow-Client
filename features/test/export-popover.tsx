"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  CheckCheckIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  LoaderIcon,
  XCircleIcon,
} from "lucide-react";
import { IconBrandGithub } from "@tabler/icons-react";
import Link from "next/link";
import { AxiosError } from "axios";

// Đảm bảo import đúng từ các component của dự án ông
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Import apiClient của dự án
import apiClient from "@/lib/apiClient";

const formSchema = z.object({
  repoName: z
    .string()
    .min(1, "Repository name is required")
    .max(100, "Repository name is too long")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Only alphanumeric characters, hyphens, underscores, and dots are allowed",
    ),
  visibility: z.enum(["public", "private"]),
  description: z.string().max(350, "Description is too long").optional(),
});

type ExportFormValues = z.infer<typeof formSchema>;

interface ExportPopoverProps {
  testId: string;
}

interface ProjectState {
  name: string;
  exportStatus: "idle" | "exporting" | "completed" | "failed";
  exportRepoUrl: string;
}

export const ExportPopover = ({ testId }: ExportPopoverProps) => {
  const [open, setOpen] = useState(false);
  
  // Mock data project (Thực tế ông sẽ lấy từ props hoặc Context)
  const [project, setProject] = useState<ProjectState>({
    name: "ai-techflow-test",
    exportStatus: "idle",
    exportRepoUrl: "",
  });
  
  const exportStatus = project?.exportStatus;
  const exportRepoUrl = project?.exportRepoUrl;
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset
  } = useForm<ExportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoName: project?.name?.replace(/[^a-zA-Z0-9._-]/g, "-") ?? "",
      visibility: "private",
      description: "",
    },
  });

  const onSubmit = async (data: ExportFormValues) => {
    try {
      setProject({ ...project, exportStatus: "exporting" });
      
      // Thay thế ky bằng apiClient
      await apiClient.post("/api/github/export", {
        testId,
        repoName: data.repoName,
        visibility: data.visibility,
        description: data.description || undefined,
      });

      toast.success("Export started...");
      setProject({ ...project, exportStatus: "completed", exportRepoUrl: `https://github.com/user/${data.repoName}` }); // Giả lập thành công

    } catch (error) {
      setProject({ ...project, exportStatus: "failed" });
      
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.error || "";
        
        if (errorMessage.includes("Pro plan required")) {
          toast.error("Upgrade to import repositories");
          setOpen(false);
          return;
        }

        if (errorMessage.includes("GitHub not connected")) {
          toast.error("GitHub account not connected");
          setOpen(false);
          return;
        }
      }
      toast.error("Unable to export repository");
    }
  };

  const handleCancelExport = async () => {
    try {
      await apiClient.post("/api/github/export/cancel", { testId });
      setProject({ ...project, exportStatus: "idle" });
    } catch (error) {
      toast.error("Failed to cancel export");
    }
  };

  const handleResetExport = async () => {
    try {
      await apiClient.post("/api/github/export/reset", { testId });
      setProject({ ...project, exportStatus: "idle", exportRepoUrl: "" });
      reset(); // Reset form về mặc định
      setOpen(false);
    } catch (error) {
      toast.error("Failed to reset export");
    }
  };

  const renderContent = () => {
    if (exportStatus === "exporting") {
      return (
        <div className="flex flex-col items-center gap-3">
          <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Exporting to GitHub...</p>
          <Button size="sm" variant="outline" className="w-full" onClick={handleCancelExport}>
            Cancel
          </Button>
        </div>
      );
    }

    if (exportStatus === "completed" && exportRepoUrl) {
      return (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2Icon className="size-6 text-emerald-500" />
          <p className="text-sm font-medium">Repository created</p>
          <p className="text-xs text-muted-foreground text-center">
            Your project has been exported to GitHub.
          </p>
          <div className="flex flex-col w-full gap-2">
            <Button size="sm" className="w-full" asChild>
              <Link href={exportRepoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="size-4 mr-1" /> View on GitHub
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={handleResetExport}>
              Close
            </Button>
          </div>
        </div>
      );
    }

    if (exportStatus === "failed") {
      return (
        <div className="flex flex-col items-center gap-3">
          <XCircleIcon className="size-6 text-rose-500" />
          <p className="text-sm font-medium">Unable to export</p>
          <p className="text-xs text-muted-foreground text-center">
            Something went wrong. Please try again.
          </p>
          <Button size="sm" variant="outline" className="w-full" onClick={handleResetExport}>
            Retry
          </Button>
        </div>
      );
    }

    // Giao diện Form mặc định (idle)
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Export to GitHub</h4>
            <p className="text-xs text-muted-foreground">
              Export your project to a GitHub repository.
            </p>
          </div>

          <Controller
            name="repoName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Repository Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="my-project"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="visibility"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Visibility</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value: "public" | "private") => field.onChange(value)}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="A short description of your project"
                  rows={2}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Button type="submit" size="sm" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Repository"}
          </Button>
        </div>
      </form>
    );
  };

  const getStatusIcon = () => {
    if (exportStatus === "exporting") return <LoaderIcon className="size-3.5 animate-spin" />;
    if (exportStatus === "completed") return <CheckCheckIcon className="size-3.5 text-emerald-500" />;
    if (exportStatus === "failed") return <XCircleIcon className="size-3.5 text-red-500" />;
    return <IconBrandGithub className="size-3.5" />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-1.5 h-full px-3 cursor-pointer text-muted-foreground border-l hover:bg-accent/30">
          {getStatusIcon()}
          <span className="text-sm">Export</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        {renderContent()}
      </PopoverContent>
    </Popover>
  );
};