"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import Image from "next/image";
import { createTeacher, updateTeacher } from "@/lib/api";
import { useState } from "react";
import { useNotification } from "@/components/NotificationProvider";

const schema = z.object({
  teacherId: z.string().min(3, "Teacher ID must be at least 3 characters"),
  employeeId: z.string().optional(),
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .optional(),
  password: z.string().optional(),

  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fatherHusbandName: z.string().optional(),
  photo: z.string().optional(),

  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),

  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  maritalStatus: z.enum(["SINGLE", "MARRIED"]).optional(),
  bloodType: z.string().optional(),
  nationality: z.string().optional(),

  nationalId: z.string().optional(),
  passportNo: z.string().optional(),

  joiningDate: z.string().optional(),

  employmentType: z.enum(["FULL_TIME", "CONTRACT", "INTERN"]).optional(),

  employmentStatus: z
    .enum(["ACTIVE", "ON_LEAVE", "RESIGNED", "TERMINATED", "RETIRED"])
    .optional(),

  designation: z.string().optional(),

  latestQualification: z.string().optional(),
  specialization: z.string().optional(),

  experienceYears: z.preprocess(
    (value) => {
      if (value === "" || value === undefined || value === null) {
        return undefined;
      }

      const numberValue = Number(value);

      return Number.isNaN(numberValue) ? undefined : numberValue;
    },
    z
      .number()
      .int()
      .min(0, "Experience cannot be negative")
      .optional()
  ),

  experienceField: z.string().optional(),
  bio: z.string().optional(),

  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),

  isActive: z.boolean().optional(),
});

type Inputs = z.infer<typeof schema>;

type TeacherFormProps = {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
};

const TeacherForm = ({ type, data, onSuccess }: TeacherFormProps) => {
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
      teacherId: data?.teacherId || "",
      employeeId: data?.employeeId || "",
      email: data?.email || "",
      username: data?.username || "",
      password: "",

      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      fatherHusbandName: data?.fatherHusbandName || "",
      photo: data?.photo || "",

      phone: data?.phone || "",
      alternatePhone: data?.alternatePhone || "",
      address: data?.address || "",
      city: data?.city || "",
      state: data?.state || "",
      country: data?.country || "",
      postalCode: data?.postalCode || "",

      dateOfBirth: data?.dateOfBirth
        ? data.dateOfBirth.split("T")[0]
        : "",

      gender: data?.gender || "MALE",
      maritalStatus: data?.maritalStatus || "SINGLE",
      bloodType: data?.bloodType || "",
      nationality: data?.nationality || "",

      nationalId: data?.nationalId || "",
      passportNo: data?.passportNo || "",

      joiningDate: data?.joiningDate
        ? data.joiningDate.split("T")[0]
        : "",

      employmentType: data?.employmentType || "FULL_TIME",
      employmentStatus: data?.employmentStatus || "ACTIVE",
      designation: data?.designation || "",

      latestQualification: data?.latestQualification || "",
      specialization: data?.specialization || "",

      experienceYears:
        data?.experienceYears !== undefined &&
        data?.experienceYears !== null
          ? Number(data.experienceYears)
          : undefined,

      experienceField: data?.experienceField || "",
      bio: data?.bio || "",

      emergencyContactName: data?.emergencyContactName || "",
      emergencyContactPhone: data?.emergencyContactPhone || "",
      emergencyContactRelation: data?.emergencyContactRelation || "",

      isActive: data?.isActive ?? true,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const payload = {
        ...formData,

        password: formData.password || undefined,

        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : undefined,

        joiningDate: formData.joiningDate
          ? new Date(formData.joiningDate).toISOString()
          : undefined,

        experienceYears: formData.experienceYears,
      };

      if (type === "create") {
        await createTeacher(payload);

        showNotification("Teacher created successfully", "success");
      } else {
        await updateTeacher(data.id, payload);

        showNotification("Teacher updated successfully", "success");
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Teacher save error:", error);

      showNotification(
        error?.message || `Failed to ${type} teacher`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-6 max-h-[75vh] overflow-y-auto pr-3 scroll-smooth"
    >
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update teacher"}
      </h1>

      {/* Authentication Information */}
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Teacher ID"
          name="teacherId"
          register={register}
          error={errors.teacherId}
        />

        <InputField
          label="Employee ID"
          name="employeeId"
          register={register}
          error={errors.employeeId}
        />

        <InputField
          label="Username"
          name="username"
          register={register}
          error={errors.username}
        />

        <InputField
          label="Email"
          name="email"
          register={register}
          error={errors.email}
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

      {/* Personal Information */}
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="firstName"
          register={register}
          error={errors.firstName}
        />

        <InputField
          label="Last Name"
          name="lastName"
          register={register}
          error={errors.lastName}
        />

        <InputField
          label="Father / Husband Name"
          name="fatherHusbandName"
          register={register}
          error={errors.fatherHusbandName}
        />

        <InputField
          label="Phone"
          name="phone"
          register={register}
          error={errors.phone}
        />

        <InputField
          label="Alternate Phone"
          name="alternatePhone"
          register={register}
          error={errors.alternatePhone}
        />

        <InputField
          label="Address"
          name="address"
          register={register}
          error={errors.address}
        />

        <InputField
          label="City"
          name="city"
          register={register}
          error={errors.city}
        />

        <InputField
          label="State"
          name="state"
          register={register}
          error={errors.state}
        />

        <InputField
          label="Country"
          name="country"
          register={register}
          error={errors.country}
        />

        <InputField
          label="Postal Code"
          name="postalCode"
          register={register}
          error={errors.postalCode}
        />

        <InputField
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          register={register}
          error={errors.dateOfBirth}
        />

        <InputField
          label="Blood Type"
          name="bloodType"
          register={register}
          error={errors.bloodType}
        />

        <InputField
          label="Nationality"
          name="nationality"
          register={register}
          error={errors.nationality}
        />

        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">Gender</label>

          <select
            {...register("gender")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Marital Status
          </label>

          <select
            {...register("maritalStatus")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="SINGLE">Single</option>
            <option value="MARRIED">Married</option>
          </select>
        </div>

        {/* Photo */}
        <div className="flex flex-col gap-2 w-full md:w-[30%] justify-center">
          <label
            htmlFor="teacher-img"
            className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
          >
            <Image
              src="/upload.png"
              alt="Upload"
              width={28}
              height={28}
            />
            Upload photo
          </label>

          <input
            id="teacher-img"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Identification */}
      <span className="text-xs text-gray-400 font-medium">
        Identification
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="National ID"
          name="nationalId"
          register={register}
          error={errors.nationalId}
        />

        <InputField
          label="Passport No."
          name="passportNo"
          register={register}
          error={errors.passportNo}
        />
      </div>

      {/* Employment */}
      <span className="text-xs text-gray-400 font-medium">
        Employment Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Joining Date"
          name="joiningDate"
          type="date"
          register={register}
          error={errors.joiningDate}
        />

        <InputField
          label="Designation"
          name="designation"
          register={register}
          error={errors.designation}
        />

        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Employment Type
          </label>

          <select
            {...register("employmentType")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="FULL_TIME">Full Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERN">Intern</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Employment Status
          </label>

          <select
            {...register("employmentStatus")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="RESIGNED">Resigned</option>
            <option value="TERMINATED">Terminated</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-[30%]">
          <input
            type="checkbox"
            {...register("isActive")}
            id="isActive"
          />

          <label
            htmlFor="isActive"
            className="text-sm text-gray-500"
          >
            Active Teacher
          </label>
        </div>
      </div>

      {/* Professional */}
      <span className="text-xs text-gray-400 font-medium">
        Professional Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Latest Qualification"
          name="latestQualification"
          register={register}
          error={errors.latestQualification}
        />

        <InputField
          label="Specialization"
          name="specialization"
          register={register}
          error={errors.specialization}
        />

        <InputField
          label="Experience Years"
          name="experienceYears"
          type="number"
          register={register}
          error={errors.experienceYears}
        />

        <InputField
          label="Experience Field"
          name="experienceField"
          register={register}
          error={errors.experienceField}
        />

        <div className="w-full">
          <label className="text-xs text-gray-500">Bio</label>

          <textarea
            {...register("bio")}
            rows={4}
            className="w-full mt-2 ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm resize-none"
          />

          {errors.bio && (
            <p className="text-xs text-red-400 mt-1">
              {errors.bio.message}
            </p>
          )}
        </div>
      </div>

      {/* Emergency Contact */}
      <span className="text-xs text-gray-400 font-medium">
        Emergency Contact
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Contact Name"
          name="emergencyContactName"
          register={register}
          error={errors.emergencyContactName}
        />

        <InputField
          label="Contact Phone"
          name="emergencyContactPhone"
          register={register}
          error={errors.emergencyContactPhone}
        />

        <InputField
          label="Relationship"
          name="emergencyContactRelation"
          register={register}
          error={errors.emergencyContactRelation}
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

export default TeacherForm;