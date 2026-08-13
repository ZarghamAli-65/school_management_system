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
  // Authentication
  studentId: z.string().min(3, "Student ID must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  username: z.string().optional(),

  // Personal
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  fatherName: z.string().min(1, "Father name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.string().optional(),
  bloodType: z.string().optional(),
  placeOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  language: z.string().optional(),

  // Contact
  street: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  photo: z.string().optional(),

  // Emergency
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),

  // Academic
  classId: z.coerce.number().optional(),
  section: z.string().optional(),
  rollNumber: z.coerce.number().optional(),
  academicYear: z.string().optional(),

  // Enrollment
  enrollmentDate: z.string().optional(),
  admissionYear: z.coerce.number().optional(),
  previousSchool: z.string().optional(),
  status: z
    .enum(["ACTIVE", "GRADUATED", "TRANSFERRED", "WITHDRAWN", "SUSPENDED"])
    .optional(),

  // Parent
  parentId: z.coerce.number().optional(),
  guardianRelation: z
    .enum(["FATHER", "MOTHER", "GUARDIAN", "OTHER"])
    .optional(),
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