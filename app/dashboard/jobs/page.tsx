/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  IconPlus,
  IconMail,
  IconBriefcase,
  IconExternalLink,
  IconClock,
  IconTrash,
  IconPencil,
  IconUsers,
} from "@tabler/icons-react";

import apiClient from "@/lib/apiClient";

enum DifficultyEnum {
  INTERN = "Intern",
  JUNIOR = "Junior",
  MID_LEVEL = "Mid-level",
  SENIOR = "Senior",
}

// Schema validation đồng bộ với Backend
const jobFormSchema = z.object({
  title: z.string().min(5, "Tiêu đề chiến dịch phải có ít nhất 5 ký tự"),
  content: z.string().min(50, "Nội dung JD cần ít nhất 50 ký tự"),
  hrEmail: z
    .string()
    .email("Định dạng email không hợp lệ")
    .optional()
    .or(z.literal("")),
  scenarioTitle: z.string().min(5, "Tiêu đề bài thi quá ngắn"),
  difficulty: z.nativeEnum(DifficultyEnum, {
    message: "Độ khó không hợp lệ",
  }),
  timeLimit: z.number().int().min(10, "Thời gian làm bài tối thiểu là 10 phút"),
  scenarioContext: z.string().min(10, "Bối cảnh (Context) không được để trống"),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export default function JobsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      hrEmail: "",
      content: "",
      scenarioTitle: "",
      difficulty: DifficultyEnum.JUNIOR,
      timeLimit: 90,
      scenarioContext: "",
    },
  });

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/dashboard/my-jobs?page=1&limit=50");
      const dataArray = res.data?.data?.items || [];
      setJobs(dataArray);
    } catch (error) {
      console.error("Lỗi lấy danh sách chiến dịch:", error);
      toast.error("Không thể tải danh sách chiến dịch.");
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    form.reset({
      title: "",
      hrEmail: "",
      content: "",
      scenarioTitle: "",
      difficulty: DifficultyEnum.JUNIOR,
      timeLimit: 90,
      scenarioContext: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (job: any) => {
    setEditingId(job.id);
    // Giả sử API trả về kèm scenario (nếu có quan hệ 1-1)
    const scenario = job.scenario || {};
    form.reset({
      title: job.title || "",
      content: job.content || "",
      hrEmail: job.hrEmail || "",
      scenarioTitle: scenario.title || "",
      difficulty: scenario.difficulty || DifficultyEnum.JUNIOR,
      timeLimit: scenario.timeLimit || 90,
      scenarioContext: scenario.context || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmitJob: SubmitHandler<JobFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        hrEmail: data.hrEmail === "" ? undefined : data.hrEmail,
      };

      if (editingId) {
        // Gọi API cập nhật (giả sử endpoint là PUT /jobs/:id)
        await apiClient.put(`/jobs/${editingId}`, payload);
        toast.success("Cập nhật chiến dịch thành công!");
      } else {
        // Tạo mới
        await apiClient.post("/jobs", payload);
        toast.success("Tạo chiến dịch và bài thi thành công!");
      }

      setIsDialogOpen(false);
      form.reset();
      fetchJobs();
    } catch (error: any) {
      console.error("Lỗi khi lưu job:", error);
      if (error.response?.status === 422 && error.response?.data?.details) {
        const errorDetails = error.response.data.details;
        errorDetails.forEach((err: any) => {
          form.setError(err.field as keyof JobFormValues, {
            type: "server",
            message: err.message,
          });
        });
        toast.error("Vui lòng kiểm tra lại thông tin nhập vào");
      } else {
        toast.error(
          error.response?.data?.message || "Có lỗi xảy ra khi lưu chiến dịch"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    try {
      await apiClient.delete(`/jobs/${jobToDelete}`);
      toast.success("Đã xóa chiến dịch");
      fetchJobs();
    } catch (error) {
      toast.error("Không thể xóa chiến dịch này");
    } finally {
      setJobToDelete(null);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Chiến dịch tuyển dụng
          </h1>
          <p className="text-muted-foreground">
            Quản lý vị trí và thiết lập AI Screening.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2">
          <IconPlus size={18} /> Tạo Job mới
        </Button>
      </div>

      {/* Dialog Tạo/Sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogDescription className="hidden">
            Biểu mẫu {editingId ? "chỉnh sửa" : "tạo"} chiến dịch tuyển dụng
          </DialogDescription>
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? "Chỉnh sửa chiến dịch & Bài Test"
                : "Thông tin vị trí tuyển dụng & Bài Test"}
            </DialogTitle>
          </DialogHeader>

          <form
            id="job-form"
            onSubmit={form.handleSubmit(handleSubmitJob)}
            className="pt-4 space-y-6"
          >
            {/* Phần 1: Thông tin chung */}
            <FieldGroup className="p-4 bg-muted/20 border rounded-lg space-y-4">
              <h3 className="font-semibold text-primary">1. Thông tin chung</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="job-title">Tên vị trí</FieldLabel>
                      <Input
                        {...field}
                        id="job-title"
                        aria-invalid={fieldState.invalid}
                        placeholder="Ví dụ: Senior NestJS Developer"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="hrEmail"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="job-email">Email nhận CV</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <IconMail
                            size={16}
                            className="text-muted-foreground mx-3"
                          />
                        </InputGroupAddon>
                        <Input
                          {...field}
                          id="job-email"
                          aria-invalid={fieldState.invalid}
                          placeholder="hr-tech@aitech.com"
                          className="pl-10"
                        />
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="content"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="job-content">
                      Mô tả chi tiết (JD)
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="job-content"
                        placeholder="Dán nội dung JD vào đây để AI phân tích..."
                        rows={4}
                        className="resize-none"
                      />
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            {/* Phần 2: Thiết lập bài thi */}
            <FieldGroup className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
              <h3 className="font-semibold text-primary">
                2. Thiết lập bài thi Web-IDE
              </h3>

              <Controller
                name="scenarioTitle"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="scenario-title">
                      Tiêu đề bài thi
                    </FieldLabel>
                    <Input
                      {...field}
                      id="scenario-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="VD: Xử lý Race Condition trong Database"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="difficulty"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Độ khó</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn độ khó" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={DifficultyEnum.INTERN}>
                            Intern
                          </SelectItem>
                          <SelectItem value={DifficultyEnum.JUNIOR}>
                            Junior
                          </SelectItem>
                          <SelectItem value={DifficultyEnum.MID_LEVEL}>
                            Mid-level
                          </SelectItem>
                          <SelectItem value={DifficultyEnum.SENIOR}>
                            Senior
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="timeLimit"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="time-limit">
                        Thời gian làm bài (Phút)
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <IconClock
                            size={16}
                            className="text-muted-foreground mx-3"
                          />
                        </InputGroupAddon>
                        <Input
                          {...field}
                          type="number"
                          id="time-limit"
                          aria-invalid={fieldState.invalid}
                          className="pl-10"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="scenarioContext"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="scenario-context">
                      Bối cảnh đề thi (Markdown)
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="scenario-context"
                        placeholder="Mô tả yêu cầu kỹ thuật ứng viên cần giải quyết..."
                        rows={4}
                        className="resize-none font-mono text-sm"
                      />
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <div className="flex justify-end gap-3 pt-4 border-t mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setIsDialogOpen(false);
              }}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" form="job-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-4" /> Đang xử lý...
                </>
              ) : editingId ? (
                "Cập nhật"
              ) : (
                "Kích hoạt chiến dịch"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Danh sách Job */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner className="size-8 text-primary" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl bg-muted/10 text-muted-foreground">
          Chưa có chiến dịch tuyển dụng nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="group relative hover:shadow-md transition-shadow border-border/50"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <IconBriefcase className="text-primary" size={24} />
                <Badge variant="secondary">
                  {job._count?.applications || 0} hồ sơ
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <CardTitle className="text-xl line-clamp-1">
                  {job.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                  <IconMail size={16} className="shrink-0" />
                  <span className="truncate">
                    {job.hrEmail || "Chưa thiết lập"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleOpenEdit(job)}
                        >
                          <IconPencil size={16} />
                          Sửa
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Chỉnh sửa chiến dịch</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => {
                            /* TODO: Điều hướng tới trang quản lý ứng viên */
                            toast.info("Tính năng đang phát triển");
                          }}
                        >
                          <IconUsers size={16} />
                          Ứng viên
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xem danh sách ứng viên</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <AlertDialog>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 border-destructive/30"
                              onClick={() => setJobToDelete(job.id)}
                            >
                              <IconTrash size={16} />
                            </Button>
                          </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Xóa chiến dịch</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Xác nhận xóa chiến dịch?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này không thể hoàn tác. Toàn bộ dữ liệu ứng
                          viên và bài test liên quan sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteConfirm}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Xóa vĩnh viễn
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}