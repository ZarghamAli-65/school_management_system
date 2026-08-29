"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

import InputField from "../InputField";
import { useNotification } from "@/components/NotificationProvider";
import {
  createClass,
  updateClass,
} from "@/lib/api/class.api";
import { getTeachers } from "@/lib/api/teacher.api";

const schema = z
  .object({
    section: z
      .string()
      .trim()
      .min(1, "Section is required")
      .max(20, "Section must not exceed 20 characters"),

    grade: z.coerce
      .number()
      .int("Grade must be an integer")
      .min(1, "Grade must be at least 1")
      .max(12, "Grade cannot be greater than 12"),

    academicYear: z
      .string()
      .trim()
      .min(4, "Academic year is required")
      .max(20, "Academic year must not exceed 20 characters"),

    roomNo: z
      .string()
      .trim()
      .min(1, "Room number is required")
      .max(20, "Room number must not exceed 20 characters"),

    capacity: z.coerce
      .number()
      .int("Capacity must be an integer")
      .min(1, "Capacity must be at least 1")
      .max(1000, "Capacity cannot exceed 1000"),

    enrolledCount: z.coerce
      .number()
      .int("Enrolled count must be an integer")
      .min(0, "Enrolled count cannot be negative")
      .max(1000, "Enrolled count cannot exceed 1000"),

    supervisor: z
      .string()
      .trim()
      .min(2, "Supervisor name must be at least 2 characters")
      .max(100, "Supervisor name must not exceed 100 characters"),

    teacherId: z
      .string()
      .min(1, "Please assign a teacher"),

    isActive: z.boolean({
      required_error: "Active status is required",
      invalid_type_error:
        "Active status must be true or false",
    }),
  })
  .refine(
    (data) => data.enrolledCount <= data.capacity,
    {
      message:
        "Enrolled count cannot be greater than class capacity",
      path: ["enrolledCount"],
    }
  );

type Inputs = z.infer<typeof schema>;

type Teacher = {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  teacherId?: string | null;
  designation?: string | null;
};

type ClassFormProps = {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
};

const ClassForm = ({
  type,
  data,
  onSuccess,
}: ClassFormProps) => {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] =
    useState(true);

  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),

    defaultValues: {
      section: data?.section || "",
      grade: data?.grade ?? undefined,
      academicYear: data?.academicYear || "",
      roomNo: data?.roomNo || "",
      capacity: data?.capacity ?? undefined,
      enrolledCount: data?.enrolledCount ?? undefined,
      supervisor: data?.supervisor || "",
      teacherId:
        data?.teachers?.find(
          (item: any) => item.isClassTeacher
        )?.teacher?.id?.toString() ||
        data?.teachers?.[0]?.teacher?.id?.toString() ||
        "",
      isActive: data?.isActive ?? true,
    },
  });

  useEffect(() => {
    async function loadTeachers() {
      try {
        setTeachersLoading(true);

        const data = await getTeachers();

        setTeachers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(
          "Error loading teachers:",
          error
        );

        showNotification(
          "Unable to load teachers.",
          "error"
        );
      } finally {
        setTeachersLoading(false);
      }
    }

    loadTeachers();
  }, [showNotification]);

  useEffect(() => {
    if (!data) return;

    reset({
      section: data?.section || "",
      grade: data?.grade ?? undefined,
      academicYear: data?.academicYear || "",
      roomNo: data?.roomNo || "",
      capacity: data?.capacity ?? undefined,
      enrolledCount: data?.enrolledCount ?? undefined,
      supervisor: data?.supervisor || "",
      teacherId:
        data?.teachers?.find(
          (item: any) => item.isClassTeacher
        )?.teacher?.id?.toString() ||
        data?.teachers?.[0]?.teacher?.id?.toString() ||
        "",
      isActive: data?.isActive ?? true,
    });
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);

      const payload = {
        section: formData.section || undefined,

        grade: formData.grade,

        academicYear:
          formData.academicYear || undefined,

        roomNo:
          formData.roomNo || undefined,

        capacity: formData.capacity,

        enrolledCount:
          formData.enrolledCount ?? undefined,

        supervisor:
          formData.supervisor || undefined,

        teacherIds: [
          Number(formData.teacherId),
        ],

        isActive:
          formData.isActive ?? true,
      };

      if (type === "create") {
        await createClass(payload);

        showNotification(
          "Class created successfully",
          "success"
        );
      } else {
        await updateClass(data.id, payload);

        showNotification(
          "Class updated successfully",
          "success"
        );
      }

      onSuccess?.();
    } catch (error: any) {
      console.error(
        "Error saving class:",
        error
      );

      showNotification(
        error?.message ||
          `Failed to ${type} class`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex max-h-[80vh] flex-col gap-8 overflow-y-auto pr-2"
    >
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new class"
          : "Update class"}
      </h1>

      <span className="text-xs font-medium text-gray-400">
        Class Information
      </span>

      <div className="flex flex-wrap justify-between gap-4">
        <InputField
          label="Section"
          name="section"
          register={register}
          defaultValue={data?.section}
          error={errors.section}
        />

        <InputField
          label="Grade"
          name="grade"
          type="number"
          register={register}
          defaultValue={data?.grade?.toString()}
          error={errors.grade}
        />

        <InputField
          label="Academic Year"
          name="academicYear"
          register={register}
          defaultValue={data?.academicYear}
          error={errors.academicYear}
        />

        <InputField
          label="Room No"
          name="roomNo"
          register={register}
          defaultValue={data?.roomNo}
          error={errors.roomNo}
        />

        <InputField
          label="Capacity"
          name="capacity"
          type="number"
          register={register}
          defaultValue={data?.capacity?.toString()}
          error={errors.capacity}
        />

        <InputField
          label="Enrolled Count"
          name="enrolledCount"
          type="number"
          register={register}
          defaultValue={
            data?.enrolledCount?.toString()
          }
          error={errors.enrolledCount}
        />

        <InputField
          label="Supervisor"
          name="supervisor"
          register={register}
          defaultValue={data?.supervisor}
          error={errors.supervisor}
        />

        <div className="flex w-full flex-col gap-2 md:w-[48%]">
          <label className="text-xs text-gray-500">
            Assigned Teacher
          </label>

          <select
            {...register("teacherId")}
            disabled={teachersLoading || loading}
            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-400 disabled:bg-gray-100"
          >
            <option value="">
              {teachersLoading
                ? "Loading teachers..."
                : "Select teacher"}
            </option>

            {teachers.map((teacher) => {
              const name =
                `${teacher.firstName ?? ""} ${
                  teacher.lastName ?? ""
                }`.trim();

              return (
                <option
                  key={teacher.id}
                  value={teacher.id}
                >
                  {name || `Teacher #${teacher.id}`}
                  {teacher.teacherId
                    ? ` - ${teacher.teacherId}`
                    : ""}
                  {teacher.designation
                    ? ` (${teacher.designation})`
                    : ""}
                </option>
              );
            })}
          </select>

          {errors.teacherId && (
            <p className="text-xs text-red-400">
              {errors.teacherId.message}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 md:w-[48%]">
          <label className="text-xs text-gray-500">
            Active Status
          </label>

          <label className="flex h-10 items-center gap-2">
            <input
              type="checkbox"
              {...register("isActive")}
              className="h-4 w-4"
            />

            <span className="text-sm">
              Active
            </span>
          </label>

          {errors.isActive && (
            <p className="text-xs text-red-400">
              {errors.isActive.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || teachersLoading}
        className="rounded-md bg-blue-400 p-2 text-white disabled:opacity-50"
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

export default ClassForm;