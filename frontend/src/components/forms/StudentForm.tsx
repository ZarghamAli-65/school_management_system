"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createStudent } from "@/lib/api/student.api";
import { useNotification } from "@/components/NotificationProvider";

const schema = z.object({
  studentId: z.string().min(1, "Student ID is required!"),
  name: z.string().min(1, "Name is required!"),
  email: z.string().email("Invalid email address!"),
  grade: z.coerce.number().min(1, "Grade is required!"),
  phone: z.string().optional(),
  address: z.string().optional(),
  photo: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const StudentForm = ({
  type,
  data,
  onSuccess,
}: {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  const { showNotification } = useNotification();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      if (type === "create") {
        await createStudent(formData);

        showNotification("Student created successfully!", "success");

        onSuccess?.();
      }

      console.log(formData);
    } catch (error) {
      console.error(error);

      showNotification("Failed to create student!", "error");
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Student" : "Update Student"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Student ID"
          name="studentId"
          register={register}
          defaultValue={data?.studentId}
          error={errors.studentId}
        />

        <InputField
          label="Name"
          name="name"
          register={register}
          defaultValue={data?.name}
          error={errors.name}
        />

        <InputField
          label="Email"
          name="email"
          type="email"
          register={register}
          defaultValue={data?.email}
          error={errors.email}
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
          label="Phone"
          name="phone"
          register={register}
          defaultValue={data?.phone}
          error={errors.phone}
        />

        <InputField
          label="Address"
          name="address"
          register={register}
          defaultValue={data?.address}
          error={errors.address}
        />

        <InputField
          label="Photo URL"
          name="photo"
          register={register}
          defaultValue={data?.photo}
          error={errors.photo}
        />
      </div>

      <button className="bg-blue-500 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;