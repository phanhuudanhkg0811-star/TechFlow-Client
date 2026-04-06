"use client";

import * as React from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { IconPlus, IconMail, IconBriefcase, IconExternalLink } from "@tabler/icons-react";

// 1. Khai báo Schema
const jobSchema = z.object({
  title: z.string().min(5, "Tên vị trí phải có ít nhất 5 ký tự."),
  hrEmail: z.string().email("Định dạng email không hợp lệ (VD: hr@aitech.com)."),
  content: z.string().min(50, "Mô tả công việc (JD) cần ít nhất 50 ký tự."),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function JobsManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [jobs, setJobs] = useState([
    { id: "1", title: "Backend Engineer", email: "backend-hr@aitech.com", count: 12 },
  ]);

  // 2. Khởi tạo Form
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      hrEmail: "",
      content: "",
    },
  });

  // 3. Xử lý Submit
  function onSubmit(data: JobFormValues) {
    console.log("Dữ liệu gửi Backend:", data);
    // eslint-disable-next-line react-hooks/purity
    const newId = Date.now().toString();
    setJobs([
      { id: newId, title: data.title, email: data.hrEmail, count: 0 },
      ...jobs,
    ]);
    setIsOpen(false);
    form.reset();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chiến dịch tuyển dụng</h1>
          <p className="text-muted-foreground">Quản lý vị trí và thiết lập AI Screening.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <IconPlus size={18} /> Tạo Job mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Thông tin vị trí tuyển dụng</DialogTitle>
            </DialogHeader>

            {/* 4. Áp dụng chuẩn FieldGroup và Controller của ông */}
            <form id="form-create-job" onSubmit={form.handleSubmit(onSubmit)} className="pt-4">
              <FieldGroup>
                
                {/* Tiêu đề Job */}
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
                        autoComplete="off"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Email nhận CV */}
                <Controller
                  name="hrEmail"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="job-email">Email nhận CV</FieldLabel>
                      {/* Dùng InputGroup để nhét Icon hoặc Text vào nhìn cho xịn */}
                      <InputGroup>
                        <InputGroupAddon>
                          <IconMail size={16} className="text-muted-foreground mx-3" />
                        </InputGroupAddon>
                        <Input
                          {...field}
                          id="job-email"
                          aria-invalid={fieldState.invalid}
                          placeholder="hr-tech@aitech.com"
                          className="pl-10" // Dịch vào một chút tránh đè icon
                        />
                      </InputGroup>
                      <FieldDescription>
                        CV gửi về email này sẽ được tự động bóc tách.
                      </FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Nội dung JD */}
                <Controller
                  name="content"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="job-content">Mô tả chi tiết (JD)</FieldLabel>
                      <InputGroup>
                        <InputGroupTextarea
                          {...field}
                          id="job-content"
                          placeholder="Dán nội dung JD vào đây để AI phân tích..."
                          rows={6}
                          className="min-h-24 resize-none"
                          aria-invalid={fieldState.invalid}
                        />
                        <InputGroupAddon align="block-end">
                          <InputGroupText className="tabular-nums text-xs">
                            {field.value.length} ký tự
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

              </FieldGroup>
            </form>

            <div className="flex justify-end gap-3 pt-4 border-t mt-2">
              <Button type="button" variant="outline" onClick={() => { form.reset(); setIsOpen(false); }}>
                Hủy bỏ
              </Button>
              <Button type="submit" form="form-create-job">
                Kích hoạt chiến dịch
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lưới danh sách Job */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <IconBriefcase className="text-primary" size={24} />
              <Badge variant="secondary">{job.count} hồ sơ</Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                <IconMail size={16} /> {job.email}
              </div>
              <Button variant="outline" className="w-full gap-2 group">
                Quản lý ứng viên
                <IconExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}