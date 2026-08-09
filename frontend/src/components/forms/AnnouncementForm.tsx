"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

import InputField from "../InputField";
import { createAnnouncement, updateAnnouncement } from "@/lib/api";
import { getClasses } from "@/lib/api/class.api";
import { useNotification } from "@/components/NotificationProvider";

const schema = z.object({
  title: z.string().min(1, "Title is required"),

  description: z.string().min(1, "Description is required"),

  classId: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }

      if (typeof value === "string") {
        const numberValue = Number(value);
        return Number.isNaN(numberValue) ? null : numberValue;
      }

      return value;
    },
    z.number().int().nullable(),
  ),
});

type Inputs = z.infer<typeof schema>;

type ClassItem = {
  id: number;
  name: string;
};

type AnnouncementFormProps = {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
};

const AnnouncementForm = ({
  type,
  data,
  onSuccess,
}: AnnouncementFormProps) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);

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
      classId: data?.classId ?? null,
    },
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const result = await getClasses();
        setClasses(result);
      } catch (error) {
        console.error("Failed to load classes:", error);
        showNotification("Failed to load classes", "error");
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, [showNotification]);

  const onSubmit = async (formData: Inputs) => {
    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        description: formData.description,
        classId: formData.classId,
      };

      if (type === "create") {
        await createAnnouncement(payload);

        showNotification(
          "Announcement created successfully",
          "success",
        );
      } else {
        await updateAnnouncement(data.id, payload);

        showNotification(
          "Announcement updated successfully",
          "success",
        );
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Announcement save error:", error);

      let message = `Failed to ${type} announcement`;

      try {
        const parsed = JSON.parse(error?.message || "");

        if (Array.isArray(parsed?.message)) {
          message = parsed.message.join(", ");
        } else if (parsed?.message) {
          message = parsed.message;
        }
      } catch {
        if (error?.message) {
          message = error.message;
        }
      }

      showNotification(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new announcement"
          : "Update announcement"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">
        Announcement Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
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

        <div className="w-full md:w-[48%] flex flex-col gap-2">
          <label className="text-xs text-gray-500">
            Class
          </label>

          <select
            {...register("classId")}
            defaultValue={data?.classId ?? ""}
            disabled={classesLoading}
            className="w-full rounded-md border border-gray-300 p-2 text-sm outline-none"
          >
            <option value="">Whole School</option>

            {classes.map((item) => (
              <option key={item.id} value={item.id}>
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

export default AnnouncementForm;

