"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  IconArrowRight,
  IconBriefcase,
  IconClock,
  IconCode,
  IconEye,
} from "@tabler/icons-react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import apiClient from "@/lib/apiClient";

type ApplicationStatus =
  | "SCREENING"
  | "TESTING"
  | "REVIEWING"
  | "COMPLETED"
  | "REJECTED";

type CandidateTest = {
  id: string;
  applicationId?: string;
  status: ApplicationStatus;
  job: {
    title: string;
  };
  testSession: {
    id: string;
    endTime: string | null;
    scenario: {
      id: string;
      title: string;
      difficulty: string;
      timeLimit: number;
      context: string;
    };
  } | null;
};

const getDisabledLabel = (test: CandidateTest, isSubmitted: boolean) => {
  if (isSubmitted) return "Submitted";
  if (test.status === "SCREENING") return "Waiting review";
  if (test.status === "REJECTED") return "Rejected";
  return "Completed";
};

export default function CandidateTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<CandidateTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<CandidateTest | null>(null);

  useEffect(() => {
    apiClient
      .get<CandidateTest[]>("/application/my-tests")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setTests(data);
      })
      .catch((error) => {
        console.error("Failed to load candidate tests:", error);
        setTests([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleStartTest = (testSessionId: string) => {
    router.push(`/tests/${testSessionId}`);
  };

  return (
    <div className="relative min-h-screen bg-background/50 py-10">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] opacity-20 [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />

      <Link
        href="/"
        className={buttonVariants({
          variant: "outline",
          className: "absolute top-4 left-4 bg-background/50 backdrop-blur-sm",
        })}
      >
        <ArrowLeft className="mr-2 size-4" />
        Back
      </Link>

      <div className="mx-auto max-w-4xl space-y-10 px-6">
        <div className="mt-8 space-y-3 text-center md:text-left">
          <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Candidate Test Room
          </h1>
          <p className="text-lg text-muted-foreground">
            Review each assigned test before starting the Web IDE.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center space-y-4">
            <Spinner className="size-8 text-primary" />
            <p className="animate-pulse text-muted-foreground">
              Loading tests...
            </p>
          </div>
        ) : tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 p-12">
            <IconBriefcase className="mb-4 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              You do not have any assigned tests yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tests.map((test) => {
              const isSubmitted = Boolean(test.testSession?.endTime);
              const isTestable =
                test.status === "TESTING" &&
                Boolean(test.testSession) &&
                !isSubmitted;

              return (
                <Card
                  key={test.id}
                  className={`group flex flex-col justify-between border-border/40 bg-card/80 backdrop-blur-sm transition-all duration-300 md:flex-row md:items-center ${
                    isTestable
                      ? "hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
                      : "opacity-75 grayscale-[0.3]"
                  }`}
                >
                  <CardHeader className="flex-1 pb-4 md:pb-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconBriefcase size={16} className="text-primary/70" />
                        <span className="font-medium">{test.job.title}</span>
                        {test.testSession && (
                          <Badge
                            variant="secondary"
                            className="ml-2 bg-primary/10 font-normal text-primary hover:bg-primary/20"
                          >
                            {test.testSession.scenario.difficulty}
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-2xl text-foreground">
                        {test.testSession?.scenario.title || "No test assigned"}
                      </CardTitle>

                      {test.testSession && (
                        <div className="flex items-center gap-5 pt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1">
                            <IconClock size={16} className="text-orange-500" />
                            <span className="font-medium">
                              {test.testSession.scenario.timeLimit} minutes
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1">
                            <IconCode size={16} className="text-blue-500" />
                            Web IDE
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardFooter className="flex justify-start gap-3 pt-0 pb-6 md:justify-end md:pt-6 md:pr-6">
                    {test.testSession && (
                      <Button
                        variant="secondary"
                        className="bg-secondary/50 hover:bg-secondary"
                        onClick={() => setSelectedTest(test)}
                      >
                        <IconEye size={18} className="mr-2" />
                        Details
                      </Button>
                    )}

                    {isTestable ? (
                      <Button
                        onClick={() => handleStartTest(test.testSession!.id)}
                        className="shadow-md shadow-primary/20 transition-shadow hover:shadow-primary/40"
                      >
                        Enter test room
                        <IconArrowRight size={18} className="ml-2" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        disabled
                        className="border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/20"
                      >
                        <CheckCircle size={18} className="mr-2" />
                        {getDisabledLabel(test, isSubmitted)}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(selectedTest)}
        onOpenChange={(open) => !open && setSelectedTest(null)}
      >
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden rounded-xl border-border/50 p-0 shadow-2xl">
          <DialogHeader className="border-b border-border/40 bg-muted/30 p-6">
            <DialogTitle className="text-2xl font-bold">
              {selectedTest?.testSession?.scenario.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-3 pt-3">
              <Badge variant="outline" className="bg-background">
                {selectedTest?.job.title}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-600 dark:bg-orange-900/30"
              >
                <IconClock size={14} className="mr-1" />
                {selectedTest?.testSession?.scenario.timeLimit} minutes
              </Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="prose prose-sm max-w-none flex-1 overflow-y-auto bg-background p-6 dark:prose-invert">
            <ReactMarkdown>
              {selectedTest?.testSession?.scenario.context ||
                "No test description."}
            </ReactMarkdown>
          </div>

          <DialogFooter className="border-t border-border/40 bg-muted/10 p-4 sm:justify-end">
            <Button variant="ghost" onClick={() => setSelectedTest(null)}>
              Close
            </Button>
            {selectedTest?.status === "TESTING" &&
              selectedTest.testSession &&
              !selectedTest.testSession.endTime && (
                <Button
                  onClick={() => handleStartTest(selectedTest.testSession!.id)}
                >
                  Start IDE
                  <IconArrowRight size={16} className="ml-2" />
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
