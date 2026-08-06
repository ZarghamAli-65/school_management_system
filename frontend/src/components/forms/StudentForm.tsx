"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { createStudent, updateStudent } from "@/lib/api/student.api";
import { getParents } from "@/lib/api/parent.api";
import { getClasses } from "@/lib/api/class.api";
import { useState, useEffect } from "react";
import { useNotification } from "@/components/NotificationProvider";

// ------------------- Zod Schema -------------------
const schema = z.object({
  // Authentication
  studentId: z.string().min(3, "Student ID must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  username: z.string().optional(),

  // Personal
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  bloodType: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  birthday: z.string().optional(),
  photo: z.string().optional(),

  // Academic
  grade: z.coerce.number().min(1, "Grade 1-12").max(12),
  classId: z.coerce.number().optional(),

  // Parent Relation
  parentId: z.coerce.number().optional(),
  guardianRelation: z
    .enum(["FATHER", "MOTHER", "GUARDIAN", "OTHER"])
    .optional(),

  // File upload
  img: z.instanceof(File).optional(),
});

type Inputs = z.infer<typeof schema>;

type StudentFormProps = {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
};

const StudentForm = ({ type, data, onSuccess }: StudentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [parents, setParents] = useState<{ id: number; name: string }[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    getClasses()
      .then((data) => setClasses(data))
      .catch((err) => console.error("Failed to load classes:", err));

    getParents()
      .then((data) => setParents(data))
      .catch((err) => console.error("Failed to load parents:", err));
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentId: data?.studentId || "",
      email: data?.email || "",
      username: data?.username || "",

      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      phone: data?.phone || "",
      address: data?.address || "",
      bloodType: data?.bloodType || "",
      gender: data?.gender || "",
      birthday: data?.birthday ? data.birthday.split("T")[0] : "",
      photo: data?.photo || "",

      grade: data?.grade || undefined,
      classId: data?.classId || undefined,

      parentId: data?.parentId || undefined,
      guardianRelation: data?.guardianRelation || undefined,
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setValue("photo", reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);

      const payload: any = {
        studentId: formData.studentId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || "",
        address: formData.address || "",
        grade: formData.grade,
        photo: formData.photo || "",
      };

      if (formData.username) {
        payload.username = formData.username;
      }

      if (formData.bloodType) {
        payload.bloodType = formData.bloodType;
      }

      if (formData.gender) {
        payload.gender = formData.gender;
      }

      if (formData.birthday) {
        payload.birthday = new Date(formData.birthday).toISOString();
      }

      if (formData.classId) {
        payload.classId = formData.classId;
      }

      if (formData.parentId) {
        payload.parentId = formData.parentId;
      }

      if (formData.guardianRelation) {
        payload.guardianRelation = formData.guardianRelation;
      }

      if (type === "create" && formData.password) {
        payload.password = formData.password;
      }

      if (type === "create") {
        await createStudent(payload);
        showNotification("Student created successfully", "success");
      } else {
        await updateStudent(data.id, payload);
        showNotification("Student updated successfully", "success");
      }

      onSuccess?.();

    } catch (error: any) {
      console.error("Full error:", error);

      const message =
        error?.message ||
        `Failed to ${type} student. Please try again.`;

      showNotification(message, "error");

    } finally {
      setLoading(false);
    }
  });
    return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update student"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Student ID"
          name="studentId"
          defaultValue={data?.studentId}
          register={register}
          error={errors.studentId}
        />

        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors.email}
        />

        <InputField
          label="Username (optional)"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors.username}
        />

        {type === "create" && (
          <InputField
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password}
          />
        )}
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="firstName"
          defaultValue={data?.firstName}
          register={register}
          error={errors.firstName}
        />

        <InputField
          label="Last Name"
          name="lastName"
          defaultValue={data?.lastName}
          register={register}
          error={errors.lastName}
        />

        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />

        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />

        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />

        {/* Gender */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">
            Gender
          </label>

          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gender")}
            defaultValue={data?.gender || ""}
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Birthday */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">
            Birthday
          </label>

          <input
            type="date"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("birthday")}
            defaultValue={
              data?.birthday
                ? data.birthday.split("T")[0]
                : ""
            }
          />
        </div>

        <InputField
          label="Grade"
          name="grade"
          type="number"
          defaultValue={data?.grade}
          register={register}
          error={errors.grade}
        />

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
            <option value="">None</option>

            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Guardian / Parent */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">
            Guardian
          </label>

          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("parentId")}
            defaultValue={data?.parentId || ""}
          >
            <option value="">
              Select Guardian
            </option>

            {parents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </select>
        </div>

        {/* Guardian Relation */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">
            Guardian Relation
          </label>

          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("guardianRelation")}
            defaultValue={data?.guardianRelation || ""}
          >
            <option value="">
              Select Relation
            </option>

            <option value="FATHER">
              Father
            </option>

            <option value="MOTHER">
              Mother
            </option>

            <option value="GUARDIAN">
              Guardian
            </option>

            <option value="OTHER">
              Other
            </option>
          </select>
        </div>

        {/* Photo */}
        <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
          <label
            className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
            htmlFor="img"
          >
            <Image
              src="/upload.png"
              alt="Upload"
              width={28}
              height={28}
            />

            <span>
              Upload a photo
            </span>
          </label>

          <input
            type="file"
            id="img"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
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

export default StudentForm;