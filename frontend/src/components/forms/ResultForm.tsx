// components/forms/ResultForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { useEffect, useState } from "react";
import { useNotification } from "@/components/NotificationProvider";
import { createResult, updateResult } from "@/lib/api/result.api";
import { getStudents } from "@/lib/api/student.api";
import { getSubjects } from "@/lib/api/subject.api";
import { getClasses } from "@/lib/api/class.api";
import { getTeachers } from "@/lib/api/teacher.api";
import { getExams } from "@/lib/api/exam.api";
import { getAssignments } from "@/lib/api/assignment.api";

// Zod schema expects lowercase enum values
const schema = z.object({
  studentId: z.coerce.number().min(1, "Select a student"),
  subjectId: z.coerce.number().min(1, "Select a subject"),
  classId: z.coerce.number().min(1, "Select a class"),
  teacherId: z.coerce.number().min(1, "Select a teacher"),
  type: z.enum(["exam", "assignment"]),
  examId: z.coerce.number().optional(),
  assignmentId: z.coerce.number().optional(),
  obtainedMarks: z.coerce.number().min(0, "Marks must be 0 or more"),
  remarks: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

type ResultFormProps = {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
};

const ResultForm = ({ type, data, onSuccess }: ResultFormProps) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(true);

  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentId: data?.studentId || undefined,
      subjectId: data?.subjectId || undefined,
      classId: data?.classId || undefined,
      teacherId: data?.teacherId || undefined,
      // Ensure lowercase, fallback to "exam"
      type: data?.type?.toLowerCase() || "exam",
      examId: data?.examId || undefined,
      assignmentId: data?.assignmentId || undefined,
      obtainedMarks: data?.obtainedMarks || undefined,
      remarks: data?.remarks || "",
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setDropdownLoading(true);
        const [studentsRes, subjectsRes, classesRes, teachersRes, examsRes, assignmentsRes] =
          await Promise.all([
            getStudents(),
            getSubjects(),
            getClasses(),
            getTeachers(),
            getExams(),
            getAssignments(),
          ]);
        setStudents(studentsRes);
        setSubjects(subjectsRes);
        setClasses(classesRes);
        setTeachers(teachersRes);
        setExams(examsRes);
        setAssignments(assignmentsRes);
      } catch (err: any) {
        showNotification("Failed to load form data", "error");
      } finally {
        setDropdownLoading(false);
      }
    };
    fetchDropdowns();
  }, [showNotification]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);
      const payload = {
        studentId: formData.studentId,
        subjectId: formData.subjectId,
        classId: formData.classId,
        teacherId: formData.teacherId,
        type: formData.type, // now correctly "exam" or "assignment"
        examId: formData.examId,
        assignmentId: formData.assignmentId,
        obtainedMarks: formData.obtainedMarks,
        remarks: formData.remarks,
      };
      if (type === "create") {
        await createResult(payload);
        showNotification("Result created successfully", "success");
      } else {
        await updateResult(data.id, payload);
        showNotification("Result updated successfully", "success");
      }
      onSuccess?.();
    } catch (error: any) {
      showNotification(error.message || `Failed to ${type} result`, "error");
    } finally {
      setLoading(false);
    }
  });

  if (dropdownLoading) {
    return <div className="text-gray-500 p-4">Loading form data...</div>;
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Result" : "Update Result"}
      </h1>

      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId", { valueAsNumber: true })}
            defaultValue={data?.studentId || ""}
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
          {errors.studentId && <p className="text-xs text-red-400">{errors.studentId.message}</p>}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId", { valueAsNumber: true })}
            defaultValue={data?.subjectId || ""}
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.subjectId && <p className="text-xs text-red-400">{errors.subjectId.message}</p>}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId", { valueAsNumber: true })}
            defaultValue={data?.classId || ""}
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.classId && <p className="text-xs text-red-400">{errors.classId.message}</p>}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teacher</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teacherId", { valueAsNumber: true })}
            defaultValue={data?.teacherId || ""}
          >
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>
          {errors.teacherId && <p className="text-xs text-red-400">{errors.teacherId.message}</p>}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Result Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("type")}
            defaultValue={data?.type?.toLowerCase() || "exam"}
          >
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
          </select>
          {errors.type && <p className="text-xs text-red-400">{errors.type.message}</p>}
        </div>

        {selectedType === "exam" && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Exam</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("examId", { valueAsNumber: true })}
              defaultValue={data?.examId || ""}
            >
              <option value="">Select exam</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
            {errors.examId && <p className="text-xs text-red-400">{errors.examId.message}</p>}
          </div>
        )}

        {selectedType === "assignment" && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Assignment</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("assignmentId", { valueAsNumber: true })}
              defaultValue={data?.assignmentId || ""}
            >
              <option value="">Select assignment</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
            {errors.assignmentId && <p className="text-xs text-red-400">{errors.assignmentId.message}</p>}
          </div>
        )}

        <InputField
          label="Obtained Marks"
          name="obtainedMarks"
          type="number"
          defaultValue={data?.obtainedMarks}
          register={register}
          error={errors.obtainedMarks}
        />

        <InputField
          label="Remarks"
          name="remarks"
          defaultValue={data?.remarks}
          register={register}
          error={errors.remarks}
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

export default ResultForm;