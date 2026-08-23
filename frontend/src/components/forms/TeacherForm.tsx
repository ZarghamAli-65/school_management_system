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
  // ===== Authentication =====
  teacherId: z
    .string()
    .trim()
    .min(3, "Teacher ID must be at least 3 characters")
    .max(30, "Teacher ID must not exceed 30 characters"),

  employeeId: z
    .string()
    .trim()
    .min(1, "Employee ID is required")
    .max(30, "Employee ID must not exceed 30 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(150, "Email must not exceed 150 characters"),

  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),

  // ===== Personal Information =====
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),

  fatherHusbandName: z
    .string()
    .trim()
    .min(2, "Father / Husband name must be at least 2 characters")
    .max(100, "Father / Husband name must not exceed 100 characters"),

  photo: z
    .string()
    .trim()
    .min(1, "Photo is required")
    .optional(),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(
      /^[0-9]+$/,
      "Phone must contain numbers only"
    ),

  alternatePhone: z
    .string()
    .trim()
    .min(7, "Alternate phone must be at least 7 digits")
    .max(15, "Alternate phone must not exceed 15 digits")
    .regex(
      /^[0-9]+$/,
      "Alternate phone must contain numbers only"
    )
    .optional(),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must not exceed 200 characters"),

  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must not exceed 100 characters"),

  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters")
    .max(100, "State must not exceed 100 characters"),

  country: z
    .string()
    .trim()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must not exceed 100 characters"),

  postalCode: z
    .string()
    .trim()
    .min(3, "Postal code must be at least 3 characters")
    .max(10, "Postal code must not exceed 10 characters")
    .regex(
      /^[0-9]+$/,
      "Postal code must contain numbers only"
    ),

  dateOfBirth: z
    .string()
    .trim()
    .min(1, "Date of birth is required"),

  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    errorMap: () => ({
      message: "Gender must be MALE, FEMALE, or OTHER",
    }),
  }),

  maritalStatus: z.enum(["SINGLE", "MARRIED"], {
    errorMap: () => ({
      message: "Marital status must be SINGLE or MARRIED",
    }),
  }),

  bloodType: z
    .string()
    .trim()
    .min(1, "Blood type is required")
    .max(5, "Blood type must not exceed 5 characters"),

  nationality: z
    .string()
    .trim()
    .min(2, "Nationality must be at least 2 characters")
    .max(50, "Nationality must not exceed 50 characters"),

  // ===== Identification =====
  nationalId: z
    .string()
    .trim()
    .min(5, "National ID is required")
    .max(30, "National ID must not exceed 30 characters")
    .regex(
      /^[0-9-]+$/,
      "National ID can contain numbers and dash (-) only"
    ),

  passportNo: z
    .string()
    .trim()
    .min(5, "Passport number must be at least 5 characters")
    .max(20, "Passport number must not exceed 20 characters")
    .optional(),

  // ===== Employment =====
  joiningDate: z
    .string()
    .trim()
    .min(1, "Joining date is required"),

  employmentType: z.enum(
    ["FULL_TIME", "CONTRACT", "INTERN"],
    {
      errorMap: () => ({
        message:
          "Employment type must be FULL_TIME, CONTRACT, or INTERN",
      }),
    }
  ),

  employmentStatus: z.enum(
    [
      "ACTIVE",
      "ON_LEAVE",
      "RESIGNED",
      "TERMINATED",
      "RETIRED",
    ],
    {
      errorMap: () => ({
        message:
          "Employment status must be ACTIVE, ON_LEAVE, RESIGNED, TERMINATED, or RETIRED",
      }),
    }
  ),

  designation: z
    .string()
    .trim()
    .min(2, "Designation must be at least 2 characters")
    .max(100, "Designation must not exceed 100 characters"),

  // ===== Professional =====
  latestQualification: z
    .string()
    .trim()
    .min(2, "Latest qualification must be at least 2 characters")
    .max(150, "Latest qualification must not exceed 150 characters"),

  specialization: z
    .string()
    .trim()
    .min(2, "Specialization must be at least 2 characters")
    .max(150, "Specialization must not exceed 150 characters"),

  experienceYears: z.coerce
    .number({
      required_error: "Experience years is required",
      invalid_type_error: "Experience years must be a number",
    })
    .int("Experience years must be an integer")
    .min(0, "Experience cannot be negative")
    .max(60, "Experience years cannot exceed 60"),

  experienceField: z
    .string()
    .trim()
    .min(2, "Experience field must be at least 2 characters")
    .max(150, "Experience field must not exceed 150 characters"),

  bio: z
    .string()
    .trim()
    .min(10, "Bio must be at least 10 characters")
    .max(1000, "Bio must not exceed 1000 characters")
    .optional(),

  // ===== Emergency Contact =====
  emergencyContactName: z
    .string()
    .trim()
    .min(2, "Emergency contact name must be at least 2 characters")
    .max(100, "Emergency contact name must not exceed 100 characters"),

  emergencyContactPhone: z
    .string()
    .trim()
    .min(7, "Emergency contact phone must be at least 7 digits")
    .max(15, "Emergency contact phone must not exceed 15 digits")
    .regex(
      /^[0-9]+$/,
      "Emergency contact phone must contain numbers only"
    ),

  emergencyContactRelation: z
    .string()
    .trim()
    .min(2, "Emergency contact relationship must be at least 2 characters")
    .max(50, "Emergency contact relationship must not exceed 50 characters"),

  isActive: z.boolean({
    required_error: "Active status is required",
    invalid_type_error: "Active status must be true or false",
  }),
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