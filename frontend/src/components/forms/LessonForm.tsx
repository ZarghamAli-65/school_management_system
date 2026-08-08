"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

import { useNotification } from "@/components/NotificationProvider";
import InputField from "../InputField";

import {
  createLesson,
  updateLesson,
} from "@/lib/api/lesson.api";

import { getSubjects } from "@/lib/api/subject.api";
import { getClasses } from "@/lib/api/class.api";
import { getTeachers } from "@/lib/api/teacher.api";

// ------------------- Zod Schema -------------------

const schema = z.object({
  subjectId: z.coerce.number().min(1, "Subject is required"),
  classId: z.coerce.number().min(1, "Class is required"),
  teacherId: z.coerce.number().min(1, "Teacher is required"),

  day: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ]),

  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

type Inputs = z.infer<typeof schema>;

type LessonFormProps = {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
};

const LessonForm = ({
  type,
  data,
  onSuccess,
}: LessonFormProps) => {
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

  // ------------------- Load Relations -------------------

  useEffect(() => {
    getSubjects()
      .then((data) => setSubjects(data))
      .catch((err) =>
        console.error("Failed to load subjects:", err)
      );

    getClasses()
      .then((data) => setClasses(data))
      .catch((err) =>
        console.error("Failed to load classes:", err)
      );

    getTeachers()
      .then((data) => setTeachers(data))
      .catch((err) =>
        console.error("Failed to load teachers:", err)
      );
  }, []);

  // ------------------- Form -------------------

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
        ? new Date(data.startTime).toTimeString().slice(0, 5)
        : "",

      endTime: data?.endTime
        ? new Date(data.endTime).toTimeString().slice(0, 5)
        : "",
    },
  });

  // ------------------- Submit -------------------

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);

      const today = new Date().toISOString().split("T")[0];

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
          "Lesson created successfully",
          "success"
        );
      } else {
        await updateLesson(data.id, payload);

        showNotification(
          "Lesson updated successfully",
          "success"
        );
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Full error:", error);

      const message =
        error?.message ||
        `Failed to ${type} lesson. Please try again.`;

      showNotification(message, "error");
    } finally {
      setLoading(false);
    }
  });

  // ------------------- UI -------------------

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={onSubmit}
    >
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new lesson"
          : "Update lesson"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">
        Lesson Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Subject */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
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

        {/* Class */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
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

            {classes.map((cls) => (
              <option
                key={cls.id}
                value={cls.id}
              >
                {cls.name}
              </option>
            ))}
          </select>

          {errors.classId && (
            <span className="text-xs text-red-400">
              {errors.classId.message}
            </span>
          )}
        </div>

        {/* Teacher */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
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

        {/* Day */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
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
            <option value="THURSDAY">Thursday</option>
            <option value="FRIDAY">Friday</option>
            <option value="SATURDAY">Saturday</option>
          </select>

          {errors.day && (
            <span className="text-xs text-red-400">
              {errors.day.message}
            </span>
          )}
        </div>

        {/* Start Time */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
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

        {/* End Time */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
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

export default LessonForm;