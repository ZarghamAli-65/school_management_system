"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import InputField from "../InputField";
import { useNotification } from "@/components/NotificationProvider";
import {
  createClass,
  updateClass,
} from "@/lib/api/class.api";

const schema = z.object({
  name: z.string().min(1, "Class name is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  grade: z.coerce.number().min(1).max(12),
  supervisor: z.string().min(1, "Supervisor is required"),
});

type Inputs = z.infer<typeof schema>;

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

  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data?.name || "",
      capacity: data?.capacity || undefined,
      grade: data?.grade || undefined,
      supervisor: data?.supervisor || "",
    },
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        capacity: formData.capacity,
        grade: formData.grade,
        supervisor: formData.supervisor,
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
      console.error(error);

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
      className="flex flex-col gap-8"
      onSubmit={onSubmit}
    >
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new class"
          : "Update class"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">
        Class Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">

        <InputField
          label="Class Name"
          name="name"
          register={register}
          defaultValue={data?.name}
          error={errors.name}
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
          label="Grade"
          name="grade"
          type="number"
          register={register}
          defaultValue={data?.grade?.toString()}
          error={errors.grade}
        />

        <InputField
          label="Supervisor"
          name="supervisor"
          register={register}
          defaultValue={data?.supervisor}
          error={errors.supervisor}
        />

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

export default ClassForm;