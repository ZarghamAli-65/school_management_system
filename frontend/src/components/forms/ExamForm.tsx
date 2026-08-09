// components/forms/ExamForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { useEffect, useState } from "react";
import { useNotification } from "@/components/NotificationProvider";
import { createExam, updateExam } from "@/lib/api/exam.api";
import { getSubjects } from "@/lib/api/subject.api";
import { getClasses } from "@/lib/api/class.api";
import { getTeachers } from "@/lib/api/teacher.api";

// ---------- Zod Schema with coercion ----------
const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  // Coerce to number for IDs
  subjectId: z.coerce.number().min(1, "Please select a subject"),
  classId: z.coerce.number().min(1, "Please select a class"),
  teacherId: z.coerce.number().min(1, "Please select a teacher"),
  examDate: z.string().min(1, "Exam date is required"),
  durationMinutes: z.coerce.number().optional(),
  totalMarks: z.coerce.number().min(1, "Total marks must be at least 1"),
  passingMarks: z.coerce.number().min(0, "Passing marks must be 0 or more"),
  status: z.enum(["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"]).optional(),
});

type Inputs = z.infer<typeof schema>;

type ExamFormProps = {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
};

const ExamForm = ({ type, data, onSuccess }: ExamFormProps) => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [dropdownError, setDropdownError] = useState<string | null>(null);

  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      subjectId: data?.subjectId || undefined,
      classId: data?.classId || undefined,
      teacherId: data?.teacherId || undefined,
      examDate: data?.examDate ? data.examDate.split("T")[0] : "",
      durationMinutes: data?.durationMinutes || undefined,
      totalMarks: data?.totalMarks || undefined,
      passingMarks: data?.passingMarks || undefined,
      status: data?.status || "DRAFT",
    },
  });

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setDropdownLoading(true);
        const [subjectsRes, classesRes, teachersRes] = await Promise.all([
          getSubjects(),
          getClasses(),
          getTeachers(),
        ]);
        setSubjects(subjectsRes);
        setClasses(classesRes);
        setTeachers(teachersRes);
        setDropdownError(null);
      } catch (err: any) {
        setDropdownError(err.message || "Failed to load form data");
        showNotification("Failed to load dropdown data", "error");
      } finally {
        setDropdownLoading(false);
      }
    };
    fetchDropdowns();
  }, [showNotification]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);
      // Build payload – all numbers are already coerced
      const payload = {
        title: formData.title,
        description: formData.description,
        subjectId: formData.subjectId,
        classId: formData.classId,
        teacherId: formData.teacherId,
        examDate: new Date(formData.examDate).toISOString(),
        durationMinutes: formData.durationMinutes,
        totalMarks: formData.totalMarks,
        passingMarks: formData.passingMarks,
        status: formData.status,
      };

      if (type === "create") {
        await createExam(payload);
        showNotification("Exam created successfully", "success");
      } else {
        await updateExam(data.id, payload);
        showNotification("Exam updated successfully", "success");
      }
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving exam:", error);
      showNotification(error?.message || `Failed to ${type} exam`, "error");
    } finally {
      setLoading(false);
    }
  });

  if (dropdownLoading) {
    return <div className="text-gray-500 p-4">Loading form data...</div>;
  }

  if (dropdownError) {
    return <div className="text-red-500 p-4">Error loading form: {dropdownError}</div>;
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create New Exam" : "Update Exam"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">Exam Information</span>
      <div className="flex flex-wrap justify-between gap-4">
        <InputField
          label="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors.title}
        />

        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors.description}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId", { valueAsNumber: true })}
            defaultValue={data?.subjectId || ""}
          >
            <option value="">Select a subject</option>
            {subjects.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.name}
              </option>
            ))}
          </select>
          {errors.subjectId && (
            <p className="text-xs text-red-400">{errors.subjectId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId", { valueAsNumber: true })}
            defaultValue={data?.classId || ""}
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classId && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teacher</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teacherId", { valueAsNumber: true })}
            defaultValue={data?.teacherId || ""}
          >
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
          {errors.teacherId && (
            <p className="text-xs text-red-400">{errors.teacherId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Exam Date</label>
          <input
            type="date"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("examDate")}
            defaultValue={data?.examDate ? data.examDate.split("T")[0] : ""}
          />
          {errors.examDate && (
            <p className="text-xs text-red-400">{errors.examDate.message}</p>
          )}
        </div>

        <InputField
          label="Duration (minutes)"
          name="durationMinutes"
          type="number"
          defaultValue={data?.durationMinutes}
          register={register}
          error={errors.durationMinutes}
        />

        <InputField
          label="Total Marks"
          name="totalMarks"
          type="number"
          defaultValue={data?.totalMarks}
          register={register}
          error={errors.totalMarks}
        />

        <InputField
          label="Passing Marks"
          name="passingMarks"
          type="number"
          defaultValue={data?.passingMarks}
          register={register}
          error={errors.passingMarks}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Status</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("status")}
            defaultValue={data?.status || "DRAFT"}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          {errors.status && (
            <p className="text-xs text-red-400">{errors.status.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-50"
      >
        {loading ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ExamForm;