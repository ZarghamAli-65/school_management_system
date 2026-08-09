// components/forms/EventForm.tsx (optional)
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { useEffect, useState } from "react";
import { useNotification } from "@/components/NotificationProvider";
import { createEvent, updateEvent } from "@/lib/api/event.api";
import { getClasses } from "@/lib/api/class.api";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  classId: z.coerce.number().optional(),
  eventDate: z.string().min(1, "Event date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  venue: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

type EventFormProps = {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
};

const EventForm = ({ type, data, onSuccess }: EventFormProps) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(true);
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
      classId: data?.classId || undefined,
      eventDate: data?.eventDate ? data.eventDate.split("T")[0] : "",
      startTime: data?.startTime ? data.startTime.slice(0, 16) : "",
      endTime: data?.endTime ? data.endTime.slice(0, 16) : "",
      venue: data?.venue || "",
    },
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setDropdownLoading(true);
        const res = await getClasses();
        setClasses(res);
      } catch (err) {
        showNotification("Failed to load classes", "error");
      } finally {
        setDropdownLoading(false);
      }
    };
    fetchClasses();
  }, [showNotification]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        classId: formData.classId,
        eventDate: new Date(formData.eventDate).toISOString(),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        venue: formData.venue,
      };
      if (type === "create") {
        await createEvent(payload);
        showNotification("Event created successfully", "success");
      } else {
        await updateEvent(data.id, payload);
        showNotification("Event updated successfully", "success");
      }
      onSuccess?.();
    } catch (error: any) {
      showNotification(error.message || `Failed to ${type} event`, "error");
    } finally {
      setLoading(false);
    }
  });

  if (dropdownLoading) {
    return <div className="text-gray-500 p-4">Loading form...</div>;
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Event" : "Update Event"}
      </h1>

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
          <label className="text-xs text-gray-500">Class (optional)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId", { valueAsNumber: true })}
            defaultValue={data?.classId || ""}
          >
            <option value="">No class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.classId && <p className="text-xs text-red-400">{errors.classId.message}</p>}
        </div>

        <InputField
          label="Event Date"
          name="eventDate"
          type="date"
          defaultValue={data?.eventDate ? data.eventDate.split("T")[0] : ""}
          register={register}
          error={errors.eventDate}
        />

        <InputField
          label="Start Time"
          name="startTime"
          type="datetime-local"
          defaultValue={data?.startTime ? data.startTime.slice(0, 16) : ""}
          register={register}
          error={errors.startTime}
        />

        <InputField
          label="End Time"
          name="endTime"
          type="datetime-local"
          defaultValue={data?.endTime ? data.endTime.slice(0, 16) : ""}
          register={register}
          error={errors.endTime}
        />

        <InputField
          label="Venue"
          name="venue"
          defaultValue={data?.venue}
          register={register}
          error={errors.venue}
        />
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

export default EventForm;