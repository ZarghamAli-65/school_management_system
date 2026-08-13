"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import {
  createSubject,
  updateSubject,
} from "@/lib/api/subject.api";
import { getTeachers } from "@/lib/api/teacher.api";
import { useEffect, useState } from "react";
import { useNotification } from "@/components/NotificationProvider";

const schema = z.object({
  code: z
    .string()
    .min(2, "Subject code must be at least 2 characters")
    .max(20, "Subject code must be less than 20 characters"),

  name: z
    .string()
    .min(2, "Subject name must be at least 2 characters")
    .max(100, "Subject name must be less than 100 characters"),

  shortName: z
    .string()
    .max(100, "Short name must be less than 100 characters")
    .optional(),

  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),

  gradeLevel: z
    .string()
    .max(50, "Grade level must be less than 50 characters")
    .optional(),

  category: z
    .string()
    .max(100, "Category must be less than 100 characters")
    .optional(),

  teacherIds: z
    .array(z.coerce.number())
    .optional(),
});

type Inputs = z.infer<typeof schema>;

type Teacher = {
  id: number;
  teacherId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type SubjectFormProps = {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
};

const SubjectForm = ({
  type,
  data,
  onSuccess,
}: SubjectFormProps) => {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const { showNotification } = useNotification();

  // =========================
  // Load Teachers
  // =========================

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await getTeachers();
        setTeachers(data);
      } catch (error) {
        console.error(
          "Failed to load teachers:",
          error
        );
      }
    };

    fetchTeachers();
  }, []);

  // =========================
  // Existing Teacher Relations
  // =========================

  const existingTeacherIds =
    data?.teachers?.map(
      (item: any) => item.teacherId
    ) || [];

  // =========================
  // Form
  // =========================

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),

    defaultValues: {
      code: data?.code || "",
      name: data?.name || "",
      shortName: data?.shortName || "",
      description: data?.description || "",
      gradeLevel: data?.gradeLevel || "",
      category: data?.category || "",
      teacherIds: existingTeacherIds,
    },
  });

  // =========================
  // Submit
  // =========================

  const onSubmit = handleSubmit(
    async (formData) => {
      try {
        setLoading(true);

        const payload = {
          code: formData.code.trim(),

          name: formData.name.trim(),

          shortName:
            formData.shortName?.trim() || undefined,

          description:
            formData.description?.trim() || undefined,

          gradeLevel:
            formData.gradeLevel?.trim() || undefined,

          category:
            formData.category?.trim() || undefined,

          teacherIds:
            formData.teacherIds || [],
        };

        if (type === "create") {
          await createSubject(payload);

          showNotification(
            "Subject created successfully",
            "success"
          );
        } else {
          await updateSubject(
            data.id,
            payload
          );

          showNotification(
            "Subject updated successfully",
            "success"
          );
        }

        onSuccess?.();
      } catch (error: any) {
        console.error(
          "Error saving subject:",
          error
        );

        showNotification(
          error?.message ||
            `Failed to ${type} subject. Please try again.`,
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  );

  // =========================
  // UI
  // =========================

  return (
    <form
      className="flex flex-col gap-8 max-h-[80vh] overflow-y-auto pr-2"
      onSubmit={onSubmit}
    >
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new subject"
          : "Update subject"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">
        Subject Information
      </span>

      <div className="flex flex-wrap justify-between gap-4">

        {/* Subject Code */}
        <InputField
          label="Subject Code"
          name="code"
          defaultValue={data?.code}
          register={register}
          error={errors.code}
        />

        {/* Subject Name */}
        <InputField
          label="Subject Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />

        {/* Short Name */}
        <InputField
          label="Short Name"
          name="shortName"
          defaultValue={data?.shortName}
          register={register}
          error={errors.shortName}
        />

        {/* Grade Level */}
        <InputField
          label="Grade Level"
          name="gradeLevel"
          defaultValue={data?.gradeLevel}
          register={register}
          error={errors.gradeLevel}
        />

        {/* Category */}
        <InputField
          label="Category"
          name="category"
          defaultValue={data?.category}
          register={register}
          error={errors.category}
        />

        {/* Teachers */}
        <div className="flex flex-col gap-2 w-full">

          <label className="text-xs text-gray-500">
            Teachers
          </label>

          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[120px] outline-none"
            {...register("teacherIds")}
            defaultValue={existingTeacherIds.map(
              String
            )}
          >
            {teachers.map((teacher) => (
              <option
                key={teacher.id}
                value={teacher.id}
              >
                {teacher.firstName || ""}{" "}
                {teacher.lastName || ""}
                {teacher.teacherId
                  ? ` (${teacher.teacherId})`
                  : ""}
              </option>
            ))}
          </select>

          <p className="text-xs text-gray-400">
            Hold Ctrl and select multiple teachers.
          </p>

          {errors.teacherIds && (
            <p className="text-xs text-red-400">
              {errors.teacherIds.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2 w-full">

          <label className="text-xs text-gray-500">
            Description
          </label>

          <textarea
            rows={5}
            placeholder="Enter subject description..."
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full outline-none resize-none"
            {...register("description")}
          />

          {errors.description?.message && (
            <p className="text-xs text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-50 sticky bottom-0"
      >
        {loading
          ? "Saving..."
          : type === "create"
          ? "Create"
          : "Update"}
      </button>
    </form>
  );
};

export default SubjectForm;