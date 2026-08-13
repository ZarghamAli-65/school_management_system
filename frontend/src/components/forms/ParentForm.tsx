"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { createParent, updateParent } from "@/lib/api/parent.api";
import { useState } from "react";
import { useNotification } from "@/components/NotificationProvider";

const schema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),

  firstName: z.string().min(1, "First name is required"),

  lastName: z.string().min(1, "Last name is required"),

  photo: z.string().optional(),

  gender: z
    .enum(["MALE", "FEMALE", "OTHER"])
    .optional(),

  dateOfBirth: z.string().optional(),

  bloodType: z.string().optional(),

  nationality: z.string().optional(),

  maritalStatus: z
    .enum(["SINGLE", "MARRIED"])
    .optional(),

  phone: z.string().optional(),

  alternatePhone: z.string().optional(),

  address: z.string().optional(),

  city: z.string().optional(),

  province: z.string().optional(),

  country: z.string().optional(),

  postalCode: z.string().optional(),

  cnic: z.string().optional(),

  qualification: z.string().optional(),

  occupation: z.string().optional(),

  employer: z.string().optional(),

  jobTitle: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

type ParentFormProps = {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
};

const ParentForm = ({
  type,
  data,
  onSuccess,
}: ParentFormProps) => {
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),

    defaultValues: {
      username: data?.username || "",
      email: data?.email || "",
      password: "",

      firstName: data?.firstName || "",
      lastName: data?.lastName || "",

      photo: data?.photo || "",

      gender: data?.gender || undefined,
      dateOfBirth: data?.dateOfBirth
        ? new Date(data.dateOfBirth)
            .toISOString()
            .split("T")[0]
        : "",

      bloodType: data?.bloodType || "",
      nationality: data?.nationality || "",
      maritalStatus: data?.maritalStatus || undefined,

      phone: data?.phone || "",
      alternatePhone: data?.alternatePhone || "",
      address: data?.address || "",
      city: data?.city || "",
      province: data?.province || "",
      country: data?.country || "",
      postalCode: data?.postalCode || "",

      cnic: data?.cnic || "",

      qualification: data?.qualification || "",

      occupation: data?.occupation || "",
      employer: data?.employer || "",
      jobTitle: data?.jobTitle || "",
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setValue("photo", reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);

      const payload: any = {
        username: formData.username || undefined,
        email: formData.email || undefined,

        firstName: formData.firstName,
        lastName: formData.lastName,

        photo: formData.photo || undefined,

        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,

        bloodType: formData.bloodType || undefined,
        nationality: formData.nationality || undefined,
        maritalStatus: formData.maritalStatus || undefined,

        phone: formData.phone || undefined,
        alternatePhone:
          formData.alternatePhone || undefined,

        address: formData.address || undefined,
        city: formData.city || undefined,
        province: formData.province || undefined,
        country: formData.country || undefined,
        postalCode: formData.postalCode || undefined,

        cnic: formData.cnic || undefined,

        qualification:
          formData.qualification || undefined,

        occupation: formData.occupation || undefined,
        employer: formData.employer || undefined,
        jobTitle: formData.jobTitle || undefined,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (type === "create") {
        await createParent(payload);

        showNotification(
          "Parent created successfully",
          "success"
        );
      } else {
        await updateParent(data.id, payload);

        showNotification(
          "Parent updated successfully",
          "success"
        );
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving parent:", error);

      showNotification(
        error?.message ||
          `Failed to ${type} parent`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-8 max-h-[80vh] overflow-y-auto pr-2"
    >
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new parent"
          : "Update parent"}
      </h1>

      {/* Authentication */}
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors.username}
        />

        <InputField
          label="Email"
          name="email"
          type="email"
          defaultValue={data?.email}
          register={register}
          error={errors.email}
        />

        <InputField
          label={
            type === "create"
              ? "Password"
              : "New Password (optional)"
          }
          name="password"
          type="password"
          register={register}
          error={errors.password}
        />
      </div>

      {/* Personal Information */}
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
          label="CNIC"
          name="cnic"
          defaultValue={data?.cnic}
          register={register}
          error={errors.cnic}
        />

        <InputField
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          defaultValue={
            data?.dateOfBirth
              ? new Date(data.dateOfBirth)
                  .toISOString()
                  .split("T")[0]
              : ""
          }
          register={register}
          error={errors.dateOfBirth}
        />

        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />

        <InputField
          label="Nationality"
          name="nationality"
          defaultValue={data?.nationality}
          register={register}
          error={errors.nationality}
        />

        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Gender
          </label>

          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gender")}
            defaultValue={data?.gender || ""}
          >
            <option value="">
              Select gender
            </option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>

          {errors.gender && (
            <span className="text-xs text-red-400">
              {errors.gender.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Marital Status
          </label>

          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("maritalStatus")}
            defaultValue={
              data?.maritalStatus || ""
            }
          >
            <option value="">
              Select status
            </option>
            <option value="SINGLE">Single</option>
            <option value="MARRIED">Married</option>
          </select>

          {errors.maritalStatus && (
            <span className="text-xs text-red-400">
              {errors.maritalStatus.message}
            </span>
          )}
        </div>

        {/* Photo */}
        <div className="flex flex-col gap-2 w-full md:w-[30%] justify-center">
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

          {data?.photo && (
            <span className="text-xs text-gray-400">
              Existing photo available
            </span>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <span className="text-xs text-gray-400 font-medium">
        Contact Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />

        <InputField
          label="Alternate Phone"
          name="alternatePhone"
          defaultValue={data?.alternatePhone}
          register={register}
          error={errors.alternatePhone}
        />

        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />

        <InputField
          label="City"
          name="city"
          defaultValue={data?.city}
          register={register}
          error={errors.city}
        />

        <InputField
          label="Province"
          name="province"
          defaultValue={data?.province}
          register={register}
          error={errors.province}
        />

        <InputField
          label="Country"
          name="country"
          defaultValue={data?.country}
          register={register}
          error={errors.country}
        />

        <InputField
          label="Postal Code"
          name="postalCode"
          defaultValue={data?.postalCode}
          register={register}
          error={errors.postalCode}
        />
      </div>

      {/* Education */}
      <span className="text-xs text-gray-400 font-medium">
        Education
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Qualification"
          name="qualification"
          defaultValue={data?.qualification}
          register={register}
          error={errors.qualification}
        />
      </div>

      {/* Professional Information */}
      <span className="text-xs text-gray-400 font-medium">
        Professional Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Occupation"
          name="occupation"
          defaultValue={data?.occupation}
          register={register}
          error={errors.occupation}
        />

        <InputField
          label="Employer"
          name="employer"
          defaultValue={data?.employer}
          register={register}
          error={errors.employer}
        />

        <InputField
          label="Job Title"
          name="jobTitle"
          defaultValue={data?.jobTitle}
          register={register}
          error={errors.jobTitle}
        />
      </div>

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

export default ParentForm;