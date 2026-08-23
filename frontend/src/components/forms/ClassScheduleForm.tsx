"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

import { useNotification } from "@/components/NotificationProvider";

import {
  createLesson,
  updateLesson,
} from "@/lib/api/classSchedule.api";

import { getSubjects } from "@/lib/api/subject.api";
import { getClasses } from "@/lib/api/class.api";
import { getTeachers } from "@/lib/api/teacher.api";

const schema = z
  .object({
    // ===== References =====
    subjectId: z.coerce
      .number({
        required_error: "Subject is required",
        invalid_type_error: "Subject ID must be a number",
      })
      .int("Subject ID must be an integer")
      .positive("Subject ID must be a positive number"),

    classId: z.coerce
      .number({
        required_error: "Class is required",
        invalid_type_error: "Class ID must be a number",
      })
      .int("Class ID must be an integer")
      .positive("Class ID must be a positive number"),

    teacherId: z.coerce
      .number({
        required_error: "Teacher is required",
        invalid_type_error: "Teacher ID must be a number",
      })
      .int("Teacher ID must be an integer")
      .positive("Teacher ID must be a positive number"),

    // ===== Schedule =====
    day: z.enum(
      [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ],
      {
        errorMap: () => ({
          message: "Please select a valid day",
        }),
      }
    ),

    startTime: z
      .string()
      .trim()
      .min(1, "Start time is required")
      .regex(
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Start time must be in HH:mm format"
      ),

    endTime: z
      .string()
      .trim()
      .min(1, "End time is required")
      .regex(
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "End time must be in HH:mm format"
      ),
  })
  .refine(
    (data) => data.startTime < data.endTime,
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

type Inputs = z.infer<typeof schema>;

type ClassScheduleFormProps = {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
};

const ClassScheduleForm = ({
  type,
  data,
  onSuccess,
}: ClassScheduleFormProps) => {
  const [loading, setLoading] = useState(false);

  const [subjects, setSubjects] = useState<
    { id: number; name: string }[]
  >([]);

  const [classes, setClasses] = useState<
    { id: number; name: string }[]
  >([]);

  const [teachers, setTeachers] = useState<
    {
      id: number;
      firstName: string;
      lastName: string;
    }[]
  >([]);

  const { showNotification } = useNotification();

  useEffect(() => {
    const loadRelations = async () => {
      try {
        const [subjectsData, classesData, teachersData] =
          await Promise.all([
            getSubjects(),
            getClasses(),
            getTeachers(),
          ]);

        setSubjects(subjectsData);
        setClasses(classesData);
        setTeachers(teachersData);
      } catch (error) {
        console.error(
          "Failed to load class schedule relations:",
          error
        );
      }
    };

    loadRelations();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),

    defaultValues: {
      subjectId: data?.subjectId || undefined,

      classId: data?.classId || undefined,

      teacherId: data?.teacherId || undefined,

      day: data?.day || undefined,

      startTime: data?.startTime
        ? new Date(data.startTime)
            .toTimeString()
            .slice(0, 5)
        : "",

      endTime: data?.endTime
        ? new Date(data.endTime)
            .toTimeString()
            .slice(0, 5)
        : "",
    },
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);

      const today = new Date()
        .toISOString()
        .split("T")[0];

      const payload = {
        subjectId: formData.subjectId,

        classId: formData.classId,

        teacherId: formData.teacherId,

        day: formData.day,

        startTime: new Date(
          `${today}T${formData.startTime}:00`
        ).toISOString(),

        endTime: new Date(
          `${today}T${formData.endTime}:00`
        ).toISOString(),
      };

      if (type === "create") {
        await createLesson(payload);

        showNotification(
          "Class schedule created successfully",
          "success"
        );
      } else {
        await updateLesson(data.id, payload);

        showNotification(
          "Class schedule updated successfully",
          "success"
        );
      }

      onSuccess?.();
    } catch (error: any) {
      console.error(
        "Class schedule error:",
        error
      );

      showNotification(
        error?.message ||
          `Failed to ${
            type === "create" ? "create" : "update"
          } class schedule.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={onSubmit}
    >
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new class schedule"
          : "Update class schedule"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">
        Class Schedule Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        {/* SUBJECT */}
        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label className="text-xs text-gray-500">
            Subject
          </label>

          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId")}
            defaultValue={data?.subjectId || ""}
          >
            <option value="">
              Select Subject
            </option>

            {subjects.map((subject) => (
              <option
                key={subject.id}
                value={subject.id}
              >
                {subject.name}
              </option>
            ))}
          </select>

          {errors.subjectId && (
            <span className="text-xs text-red-400">
              {errors.subjectId.message}
            </span>
          )}
        </div>

        {/* CLASS */}
        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label className="text-xs text-gray-500">
            Class
          </label>

          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId || ""}
          >
            <option value="">
              Select Class
            </option>

            {classes.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>

          {errors.classId && (
            <span className="text-xs text-red-400">
              {errors.classId.message}
            </span>
          )}
        </div>

        {/* TEACHER */}
        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label className="text-xs text-gray-500">
            Teacher
          </label>

          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teacherId")}
            defaultValue={data?.teacherId || ""}
          >
            <option value="">
              Select Teacher
            </option>

            {teachers.map((teacher) => (
              <option
                key={teacher.id}
                value={teacher.id}
              >
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>

          {errors.teacherId && (
            <span className="text-xs text-red-400">
              {errors.teacherId.message}
            </span>
          )}
        </div>

        {/* DAY */}
        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label className="text-xs text-gray-500">
            Day
          </label>

          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("day")}
            defaultValue={data?.day || ""}
          >
            <option value="">
              Select Day
            </option>

            <option value="MONDAY">Monday</option>
            <option value="TUESDAY">Tuesday</option>
            <option value="WEDNESDAY">
              Wednesday
            </option>
            <option value="THURSDAY">
              Thursday
            </option>
            <option value="FRIDAY">Friday</option>
            <option value="SATURDAY">
              Saturday
            </option>
          </select>

          {errors.day && (
            <span className="text-xs text-red-400">
              {errors.day.message}
            </span>
          )}
        </div>

        {/* START TIME */}
        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label className="text-xs text-gray-500">
            Start Time
          </label>

          <input
            type="time"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("startTime")}
            defaultValue={
              data?.startTime
                ? new Date(data.startTime)
                    .toTimeString()
                    .slice(0, 5)
                : ""
            }
          />

          {errors.startTime && (
            <span className="text-xs text-red-400">
              {errors.startTime.message}
            </span>
          )}
        </div>

        {/* END TIME */}
        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label className="text-xs text-gray-500">
            End Time
          </label>

          <input
            type="time"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("endTime")}
            defaultValue={
              data?.endTime
                ? new Date(data.endTime)
                    .toTimeString()
                    .slice(0, 5)
                : ""
            }
          />

          {errors.endTime && (
            <span className="text-xs text-red-400">
              {errors.endTime.message}
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-50"
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

export default ClassScheduleForm;