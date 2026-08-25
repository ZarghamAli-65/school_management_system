// components/forms/AssignmentForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { useEffect, useState } from "react";
import { useNotification } from "@/components/NotificationProvider";
import { createAssignment, updateAssignment } from "@/lib/api/assignment.api";
import { getSubjects } from "@/lib/api/subject.api";    // adjust import
import { getClasses } from "@/lib/api/class.api";        // adjust import
import { getTeachers } from "@/lib/api/teacher.api";     // adjust import

// ---------- Zod Schema ----------
const schema = z.object({
  // ===== Assignment Information =====
  title: z
    .string()
    .trim()
    .min(2, "Assignment title must be at least 2 characters")
    .max(150, "Assignment title must not exceed 150 characters"),

  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description must not exceed 500 characters"),

  // ===== References =====
  subjectId: z.coerce
    .number({
      required_error: "Please select a subject",
      invalid_type_error: "Subject ID must be a number",
    })
    .int("Subject ID must be an integer")
    .positive("Subject ID must be a positive number"),

  classId: z.coerce
    .number({
      required_error: "Please select a class",
      invalid_type_error: "Class ID must be a number",
    })
    .int("Class ID must be an integer")
    .positive("Class ID must be a positive number"),

  teacherId: z.coerce
    .number({
      required_error: "Please select a teacher",
      invalid_type_error: "Teacher ID must be a number",
    })
    .int("Teacher ID must be an integer")
    .positive("Teacher ID must be a positive number"),

  // ===== Assignment Schedule =====
  dueDate: z
    .string()
    .trim()
    .min(1, "Due date is required")
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      "Due date must be a valid date"
    ),
});

type Inputs = z.infer<typeof schema>;

type AssignmentFormProps = {
  type: "create" | "update";
  data?: any; // includes id and all fields, with relations possibly
  onSuccess?: () => void;
};

// ---------- Component ----------
const AssignmentForm = ({ type, data, onSuccess }: AssignmentFormProps) => {
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
    setValue,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      subjectId: data?.subjectId || undefined,
      classId: data?.classId || undefined,
      teacherId: data?.teacherId || undefined,
      dueDate: data?.dueDate ? data.dueDate.split("T")[0] : "", // format for date input
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
      // Build payload
      const payload = {
        title: formData.title,
        description: formData.description,
        subjectId: formData.subjectId,
        classId: formData.classId,
        teacherId: formData.teacherId,
        dueDate: new Date(formData.dueDate).toISOString(), // convert to ISO
      };

      if (type === "create") {
        await createAssignment(payload);
        showNotification("Assignment created successfully", "success");
      } else {
        await updateAssignment(data.id, payload);
        showNotification("Assignment updated successfully", "success");
      }
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving assignment:", error);
      showNotification(error?.message || `Failed to ${type} assignment`, "error");
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
        {type === "create" ? "Create New Assignment" : "Update Assignment"}
      </h1>

      {/* Assignment Details */}
      <span className="text-xs text-gray-400 font-medium">Assignment Information</span>
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
          <label className="text-xs text-gray-500">Due Date</label>
          <input
            type="date"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("dueDate")}
            defaultValue={data?.dueDate ? data.dueDate.split("T")[0] : ""}
          />
          {errors.dueDate && (
            <p className="text-xs text-red-400">{errors.dueDate.message}</p>
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

export default AssignmentForm;