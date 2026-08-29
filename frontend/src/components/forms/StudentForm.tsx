"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";

import InputField from "../InputField";
import { createStudent, updateStudent } from "@/lib/api/student.api";
import { getParents } from "@/lib/api/parent.api";
import { getClasses } from "@/lib/api/class.api";
import { useNotification } from "@/components/NotificationProvider";

const optionalString = z.string().trim().optional();

const schema = z.object({
  // Authentication
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

  password: z.string().optional(),

  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  // Personal
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
    required_error: "Please select gender",
  }),

  dateOfBirth: z.string().min(1, "Date of birth is required"),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^[0-9]+$/, "Phone must contain numbers only"),

  bloodType: optionalString,
  placeOfBirth: optionalString,
  nationality: optionalString,
  religion: optionalString,
  language: optionalString,
  photo: optionalString,

  // Contact
  street: optionalString,
  city: optionalString,
  province: optionalString,
  postalCode: optionalString,
  country: optionalString,

  // Academic
  classId: z.string().min(1, "Please select a class"),

  section: optionalString,

  rollNumber: z
    .string()
    .min(1, "Roll number is required")
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) > 0,
      "Roll number must be a positive integer"
    ),

  academicYear: z
    .string()
    .trim()
    .min(4, "Academic year is required")
    .max(20, "Academic year must not exceed 20 characters"),

  // Enrollment
  enrollmentDate: z.string().min(1, "Enrollment date is required"),

  admissionYear: z
    .string()
    .min(1, "Admission year is required")
    .refine(
      (value) =>
        Number.isInteger(Number(value)) &&
        Number(value) >= 1900 &&
        Number(value) <= new Date().getFullYear(),
      `Admission year must be between 1900 and ${new Date().getFullYear()}`
    ),

  previousSchool: optionalString,

  status: z.enum([
    "ACTIVE",
    "GRADUATED",
    "TRANSFERRED",
    "WITHDRAWN",
    "SUSPENDED",
  ]),

  // Parent / Guardian
  parentId: z.string().min(1, "Please select a parent"),

  guardianRelation: z.enum(
    ["FATHER", "MOTHER", "GUARDIAN", "OTHER"],
    {
      required_error: "Please select guardian relation",
    }
  ),

  // Emergency
  emergencyContactName: optionalString,

  emergencyContactPhone: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        !value ||
        (/^[0-9]+$/.test(value) &&
          value.length >= 7 &&
          value.length <= 15),
      "Emergency phone must contain 7 to 15 digits"
    ),

  emergencyContactRelation: optionalString,
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

const StudentForm = ({
  type,
  data,
  onSuccess,
}: StudentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [parents, setParents] = useState<ParentOption[]>([]);

  const { showNotification } = useNotification();

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
        ? new Date(data.dateOfBirth).toISOString().split("T")[0]
        : "",

      phone: data?.phone || "",
      bloodType: data?.bloodType || "",
      placeOfBirth: data?.placeOfBirth || "",
      nationality: data?.nationality || "",
      religion: data?.religion || "",
      language: data?.language || "",
      photo: data?.photo || "",

      street: data?.street || "",
      city: data?.city || "",
      province: data?.province || "",
      postalCode: data?.postalCode || "",
      country: data?.country || "",

      classId:
        data?.classId !== undefined
          ? String(data.classId)
          : data?.class?.id !== undefined
            ? String(data.class.id)
            : "",

      section: data?.section || "",

      rollNumber:
        data?.rollNumber !== undefined
          ? String(data.rollNumber)
          : "",

      academicYear: data?.academicYear || "",

      enrollmentDate: data?.enrollmentDate
        ? new Date(data.enrollmentDate).toISOString().split("T")[0]
        : "",

      admissionYear:
        data?.admissionYear !== undefined
          ? String(data.admissionYear)
          : "",

      previousSchool: data?.previousSchool || "",
      status: data?.status || "ACTIVE",

      parentId:
        data?.parentId !== undefined
          ? String(data.parentId)
          : data?.parent?.id !== undefined
            ? String(data.parent.id)
            : "",

      guardianRelation: data?.guardianRelation || undefined,

      emergencyContactName:
        data?.emergencyContactName || "",
      emergencyContactPhone:
        data?.emergencyContactPhone || "",
      emergencyContactRelation:
        data?.emergencyContactRelation || "",
    },
  });

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [classesData, parentsData] =
          await Promise.all([
            getClasses(),
            getParents(),
          ]);

        setClasses(
          Array.isArray(classesData)
            ? classesData
            : classesData?.data || []
        );

        setParents(
          Array.isArray(parentsData)
            ? parentsData
            : parentsData?.data || []
        );
      } catch (error) {
        console.error(
          "Failed to load student form data:",
          error
        );

        showNotification(
          "Failed to load classes or parents",
          "error"
        );
      }
    };

    loadFormData();
  }, [showNotification]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setValue("photo", reader.result as string, {
        shouldValidate: true,
      });
    };

    reader.readAsDataURL(file);
  };

  const onSubmit = handleSubmit(
    async (formData) => {
      try {
        setLoading(true);

        if (
          type === "create" &&
          (!formData.password ||
            formData.password.length < 8)
        ) {
          showNotification(
            "Password must be at least 8 characters",
            "error"
          );
          return;
        }

        const payload: any = {
          studentId: formData.studentId.trim(),
          email: formData.email.trim(),
          username: formData.username.trim(),

          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          fatherName: formData.fatherName.trim(),

          gender: formData.gender,

          dateOfBirth: new Date(
            formData.dateOfBirth
          ).toISOString(),

          phone: formData.phone.trim(),

          classId: Number(formData.classId),
          rollNumber: Number(formData.rollNumber),
          academicYear: formData.academicYear.trim(),

          enrollmentDate: new Date(
            formData.enrollmentDate
          ).toISOString(),

          admissionYear: Number(
            formData.admissionYear
          ),

          status: formData.status,

          parentId: Number(formData.parentId),

          guardianRelation:
            formData.guardianRelation,

          bloodType:
            formData.bloodType?.trim() ||
            undefined,

          placeOfBirth:
            formData.placeOfBirth?.trim() ||
            undefined,

          nationality:
            formData.nationality?.trim() ||
            undefined,

          religion:
            formData.religion?.trim() ||
            undefined,

          language:
            formData.language?.trim() ||
            undefined,

          photo:
            formData.photo?.trim() ||
            undefined,

          street:
            formData.street?.trim() ||
            undefined,

          city:
            formData.city?.trim() ||
            undefined,

          province:
            formData.province?.trim() ||
            undefined,

          postalCode:
            formData.postalCode?.trim() ||
            undefined,

          country:
            formData.country?.trim() ||
            undefined,

          section:
            formData.section?.trim() ||
            undefined,

          previousSchool:
            formData.previousSchool?.trim() ||
            undefined,

          emergencyContactName:
            formData.emergencyContactName?.trim() ||
            undefined,

          emergencyContactPhone:
            formData.emergencyContactPhone?.trim() ||
            undefined,

          emergencyContactRelation:
            formData.emergencyContactRelation?.trim() ||
            undefined,
        };

        if (type === "create") {
          payload.password = formData.password;

          console.log(
            "Creating student:",
            payload
          );

          await createStudent(payload);

          showNotification(
            "Student created successfully",
            "success"
          );
        } else {
          console.log(
            "Updating student:",
            payload
          );

          await updateStudent(
            data.id,
            payload
          );

          showNotification(
            "Student updated successfully",
            "success"
          );
        }

        onSuccess?.();
      } catch (error: any) {
        console.error(
          "Student save error:",
          error
        );

        showNotification(
          error?.message ||
            `Failed to ${type} student. Please try again.`,
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    (validationErrors) => {
      console.error(
        "Student form validation errors:",
        validationErrors
      );

      showNotification(
        "Please check the required fields and validation errors",
        "error"
      );
    }
  );

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

      <span className="text-xs text-gray-400 font-medium">
        Academic Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Class
          </label>

          <select
            {...register("classId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">
              Select Class
            </option>

            {classes.map((schoolClass) => (
              <option
                key={schoolClass.id}
                value={String(schoolClass.id)}
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
        </div>
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Parent / Guardian Information
      </span>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Parent / Guardian
          </label>

          <select
            {...register("parentId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">
              Select Parent
            </option>

            {parents.map((parent) => (
              <option
                key={parent.id}
                value={String(parent.id)}
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

        <div className="flex flex-col gap-2 w-full md:w-[30%]">
          <label className="text-xs text-gray-500">
            Guardian Relation
          </label>

          <select
            {...register("guardianRelation")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >
            <option value="">
              Select Relation
            </option>
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