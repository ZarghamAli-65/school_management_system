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


const schema = z.object({
  // ===== Authentication =====
  studentId: z
    .string()
    .trim()
    .min(3, "Student ID must be at least 3 characters")
    .max(30, "Student ID must not exceed 30 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(150, "Email must not exceed 150 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),

  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

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

  fatherName: z
    .string()
    .trim()
    .min(2, "Father name must be at least 2 characters")
    .max(100, "Father name must not exceed 100 characters"),

  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    errorMap: () => ({
      message: "Gender must be MALE, FEMALE, or OTHER",
    }),
  }),

  dateOfBirth: z
    .string()
    .trim()
    .min(1, "Date of birth is required"),

  bloodType: z
    .string()
    .trim()
    .min(1, "Blood type is required")
    .max(5, "Blood type must not exceed 5 characters"),

  placeOfBirth: z
    .string()
    .trim()
    .min(2, "Place of birth must be at least 2 characters")
    .max(100, "Place of birth must not exceed 100 characters"),

  nationality: z
    .string()
    .trim()
    .min(2, "Nationality must be at least 2 characters")
    .max(50, "Nationality must not exceed 50 characters"),

  religion: z
    .string()
    .trim()
    .min(2, "Religion must be at least 2 characters")
    .max(50, "Religion must not exceed 50 characters"),

  language: z
    .string()
    .trim()
    .min(2, "Language must be at least 2 characters")
    .max(50, "Language must not exceed 50 characters"),

  // ===== Contact Information =====
  street: z
    .string()
    .trim()
    .min(3, "Street address must be at least 3 characters")
    .max(200, "Street address must not exceed 200 characters"),

  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must not exceed 100 characters"),

  province: z
    .string()
    .trim()
    .min(2, "Province/State must be at least 2 characters")
    .max(100, "Province/State must not exceed 100 characters"),

  postalCode: z
    .string()
    .trim()
    .min(3, "Postal code must be at least 3 characters")
    .max(10, "Postal code must not exceed 10 characters")
    .regex(
      /^[0-9]+$/,
      "Postal code must contain numbers only"
    ),

  country: z
    .string()
    .trim()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must not exceed 100 characters"),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(
      /^[0-9]+$/,
      "Phone must contain numbers only"
    ),

  photo: z
    .string()
    .trim()
    .min(1, "Photo is required")
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
    .min(7, "Emergency phone must be at least 7 digits")
    .max(15, "Emergency phone must not exceed 15 digits")
    .regex(
      /^[0-9]+$/,
      "Emergency phone must contain numbers only"
    ),

  emergencyContactRelation: z
    .string()
    .trim()
    .min(2, "Emergency contact relationship is required")
    .max(50, "Emergency contact relationship must not exceed 50 characters"),

  // ===== Academic Information =====
  classId: z.coerce
    .number({
      required_error: "Class ID is required",
      invalid_type_error: "Class ID must be a number",
    })
    .int("Class ID must be an integer")
    .positive("Class ID must be a positive number"),

  section: z
    .string()
    .trim()
    .min(1, "Section is required")
    .max(20, "Section must not exceed 20 characters"),

  rollNumber: z.coerce
    .number({
      required_error: "Roll number is required",
      invalid_type_error: "Roll number must be a number",
    })
    .int("Roll number must be an integer")
    .positive("Roll number must be a positive number"),

  academicYear: z
    .string()
    .trim()
    .min(4, "Academic year must be valid")
    .max(20, "Academic year must not exceed 20 characters"),

  // ===== Enrollment =====
  enrollmentDate: z
    .string()
    .trim()
    .min(1, "Enrollment date is required"),

  admissionYear: z.coerce
    .number({
      required_error: "Admission year is required",
      invalid_type_error: "Admission year must be a number",
    })
    .int("Admission year must be an integer")
    .min(1900, "Admission year must be at least 1900")
    .max(
      new Date().getFullYear(),
      "Admission year cannot be in the future"
    ),

  previousSchool: z
    .string()
    .trim()
    .min(2, "Previous school must be at least 2 characters")
    .max(150, "Previous school must not exceed 150 characters"),

  status: z.enum(
    ["ACTIVE", "GRADUATED", "TRANSFERRED", "WITHDRAWN", "SUSPENDED"],
    {
      errorMap: () => ({
        message:
          "Status must be ACTIVE, GRADUATED, TRANSFERRED, WITHDRAWN, or SUSPENDED",
      }),
    }
  ),

  // ===== Parent/Guardian =====
  parentId: z.coerce
    .number({
      required_error: "Parent ID is required",
      invalid_type_error: "Parent ID must be a number",
    })
    .int("Parent ID must be an integer")
    .positive("Parent ID must be a positive number"),

  guardianRelation: z.enum(
    ["FATHER", "MOTHER", "GUARDIAN", "OTHER"],
    {
      errorMap: () => ({
        message:
          "Guardian relation must be FATHER, MOTHER, GUARDIAN, or OTHER",
      }),
    }
  ),
});

type Inputs = z.infer<typeof schema>;

type StudentFormProps = {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
};

type ClassOption = {
  id: number;
  grade: number;
  section?: string | null;
  academicYear?: string | null;
  roomNo?: string | null;
};

type ParentOption = {
  id: number;
  firstName: string;
  lastName: string;
};

const StudentForm = ({ type, data, onSuccess }: StudentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [parents, setParents] = useState<ParentOption[]>([]);

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
      password: "",

      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      fatherName: data?.fatherName || "",
      gender: data?.gender || undefined,
      dateOfBirth: data?.dateOfBirth
        ? data.dateOfBirth.split("T")[0]
        : "",
      bloodType: data?.bloodType || "",
      placeOfBirth: data?.placeOfBirth || "",
      nationality: data?.nationality || "",
      religion: data?.religion || "",
      language: data?.language || "",

      street: data?.street || "",
      city: data?.city || "",
      province: data?.province || "",
      postalCode: data?.postalCode || "",
      country: data?.country || "",
      phone: data?.phone || "",
      photo: data?.photo || "",

      emergencyContactName: data?.emergencyContactName || "",
      emergencyContactPhone: data?.emergencyContactPhone || "",
      emergencyContactRelation: data?.emergencyContactRelation || "",

      classId:
        data?.classId !== undefined
          ? Number(data.classId)
          : data?.class?.id !== undefined
            ? Number(data.class.id)
            : undefined,

      section: data?.section || "",
      rollNumber:
        data?.rollNumber !== undefined
          ? Number(data.rollNumber)
          : undefined,
      academicYear: data?.academicYear || "",

      enrollmentDate: data?.enrollmentDate
        ? data.enrollmentDate.split("T")[0]
        : "",

      admissionYear:
        data?.admissionYear !== undefined
          ? Number(data.admissionYear)
          : undefined,

      previousSchool: data?.previousSchool || "",
      status: data?.status || "ACTIVE",

      parentId:
        data?.parentId !== undefined
          ? Number(data.parentId)
          : data?.parent?.id !== undefined
            ? Number(data.parent.id)
            : undefined,

      guardianRelation: data?.guardianRelation || undefined,
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

      const payload: any = {
        studentId: formData.studentId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        fatherName: formData.fatherName,

        username: formData.username || undefined,

        password:
          type === "create"
            ? formData.password || undefined
            : undefined,

        gender: formData.gender || undefined,

        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : undefined,

        bloodType: formData.bloodType || undefined,
        placeOfBirth: formData.placeOfBirth || undefined,
        nationality: formData.nationality || undefined,
        religion: formData.religion || undefined,
        language: formData.language || undefined,

        street: formData.street || undefined,
        city: formData.city || undefined,
        province: formData.province || undefined,
        postalCode: formData.postalCode || undefined,
        country: formData.country || undefined,
        phone: formData.phone || undefined,
        photo: formData.photo || undefined,

        emergencyContactName:
          formData.emergencyContactName || undefined,

        emergencyContactPhone:
          formData.emergencyContactPhone || undefined,

        emergencyContactRelation:
          formData.emergencyContactRelation || undefined,

        classId:
          formData.classId !== undefined &&
          formData.classId !== 0
            ? Number(formData.classId)
            : undefined,

        section: formData.section || undefined,

        rollNumber:
          formData.rollNumber !== undefined &&
          formData.rollNumber !== 0
            ? Number(formData.rollNumber)
            : undefined,

        academicYear: formData.academicYear || undefined,

        enrollmentDate: formData.enrollmentDate
          ? new Date(formData.enrollmentDate).toISOString()
          : undefined,

        admissionYear:
          formData.admissionYear !== undefined &&
          formData.admissionYear !== 0
            ? Number(formData.admissionYear)
            : undefined,

        previousSchool: formData.previousSchool || undefined,

        status: formData.status || undefined,

        parentId:
          formData.parentId !== undefined &&
          formData.parentId !== 0
            ? Number(formData.parentId)
            : undefined,

        guardianRelation:
          formData.guardianRelation || undefined,
      };

      if (type === "create") {
        await createStudent(payload);

        showNotification(
          "Student created successfully",
          "success"
        );
      } else {
        await updateStudent(data.id, payload);

        showNotification(
          "Student updated successfully",
          "success"
        );
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Student save error:", error);

      const message =
        error?.message ||
        `Failed to ${type} student. Please try again.`;

      showNotification(message, "error");
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
        {type === "create"
          ? "Create a new student"
          : "Update student"}
      </h1>

      {/* Authentication */}
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Student ID"
          name="studentId"
          register={register}
          error={errors.studentId}
        />

        <InputField
          label="Email"
          name="email"
          register={register}
          error={errors.email}
        />

        <InputField
          label="Username"
          name="username"
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

      {/* Personal */}
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
          label="Father Name"
          name="fatherName"
          register={register}
          error={errors.fatherName}
        />

        <InputField
          label="Phone"
          name="phone"
          register={register}
          error={errors.phone}
        />

        <InputField
          label="Blood Type"
          name="bloodType"
          register={register}
          error={errors.bloodType}
        />

        <InputField
          label="Place of Birth"
          name="placeOfBirth"
          register={register}
          error={errors.placeOfBirth}
        />

        <InputField
          label="Nationality"
          name="nationality"
          register={register}
          error={errors.nationality}
        />

        <InputField
          label="Religion"
          name="religion"
          register={register}
          error={errors.religion}
        />

        <InputField
          label="Language"
          name="language"
          register={register}
          error={errors.language}
        />

        {/* Gender */}
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Gender
          </label>

          <select
            {...register("gender")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>

          {errors.gender && (
            <p className="text-xs text-red-400">
              {errors.gender.message}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Date of Birth
          </label>

          <input
            type="date"
            {...register("dateOfBirth")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          />

          {errors.dateOfBirth && (
            <p className="text-xs text-red-400">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        {/* Photo */}
        <div className="flex flex-col gap-2 w-full md:w-[30%] justify-center">
          <label
            htmlFor="student-img"
            className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
          >
            <Image
              src="/upload.png"
              alt="Upload"
              width={28}
              height={28}
            />

            <span>Upload a photo</span>
          </label>

          <input
            id="student-img"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Contact */}
      <span className="text-xs text-gray-400 font-medium">
        Contact Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Street"
          name="street"
          register={register}
          error={errors.street}
        />

        <InputField
          label="City"
          name="city"
          register={register}
          error={errors.city}
        />

        <InputField
          label="Province"
          name="province"
          register={register}
          error={errors.province}
        />

        <InputField
          label="Postal Code"
          name="postalCode"
          register={register}
          error={errors.postalCode}
        />

        <InputField
          label="Country"
          name="country"
          register={register}
          error={errors.country}
        />
      </div>

      {/* Academic */}
      <span className="text-xs text-gray-400 font-medium">
        Academic Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Class Relation */}
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Class
          </label>

          <select
            {...register("classId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">None</option>

            {classes.map((schoolClass) => (
              <option
                key={schoolClass.id}
                value={schoolClass.id}
              >
                Grade {schoolClass.grade}
                {schoolClass.section
                  ? ` - Section ${schoolClass.section}`
                  : ""}
                {schoolClass.academicYear
                  ? ` (${schoolClass.academicYear})`
                  : ""}
              </option>
            ))}
          </select>

          {errors.classId && (
            <p className="text-xs text-red-400">
              {errors.classId.message}
            </p>
          )}
        </div>

        <InputField
          label="Section"
          name="section"
          register={register}
          error={errors.section}
        />

        <InputField
          label="Roll Number"
          name="rollNumber"
          type="number"
          register={register}
          error={errors.rollNumber}
        />

        <InputField
          label="Academic Year"
          name="academicYear"
          register={register}
          error={errors.academicYear}
        />
      </div>

      {/* Enrollment */}
      <span className="text-xs text-gray-400 font-medium">
        Enrollment Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Enrollment Date
          </label>

          <input
            type="date"
            {...register("enrollmentDate")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          />

          {errors.enrollmentDate && (
            <p className="text-xs text-red-400">
              {errors.enrollmentDate.message}
            </p>
          )}
        </div>

        <InputField
          label="Admission Year"
          name="admissionYear"
          type="number"
          register={register}
          error={errors.admissionYear}
        />

        <InputField
          label="Previous School"
          name="previousSchool"
          register={register}
          error={errors.previousSchool}
        />

        {/* Status */}
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Student Status
          </label>

          <select
            {...register("status")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="ACTIVE">Active</option>
            <option value="GRADUATED">Graduated</option>
            <option value="TRANSFERRED">Transferred</option>
            <option value="WITHDRAWN">Withdrawn</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          {errors.status && (
            <p className="text-xs text-red-400">
              {errors.status.message}
            </p>
          )}
        </div>
      </div>

      {/* Parent / Guardian */}
      <span className="text-xs text-gray-400 font-medium">
        Parent / Guardian Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Parent Relation */}
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Parent / Guardian
          </label>

          <select
            {...register("parentId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">Select Parent</option>

            {parents.map((parent) => (
              <option
                key={parent.id}
                value={parent.id}
              >
                {parent.firstName} {parent.lastName}
              </option>
            ))}
          </select>

          {errors.parentId && (
            <p className="text-xs text-red-400">
              {errors.parentId.message}
            </p>
          )}
        </div>

        {/* Guardian Relation */}
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Guardian Relation
          </label>

          <select
            {...register("guardianRelation")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">Select Relation</option>
            <option value="FATHER">Father</option>
            <option value="MOTHER">Mother</option>
            <option value="GUARDIAN">Guardian</option>
            <option value="OTHER">Other</option>
          </select>

          {errors.guardianRelation && (
            <p className="text-xs text-red-400">
              {errors.guardianRelation.message}
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

export default StudentForm;