"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { deleteResource } from "@/lib/api";
import { useNotification } from "@/components/NotificationProvider";

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <>Loading...</>,
});

const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <>Loading...</>,
});

const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <>Loading...</>,
});

const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <>Loading...</>,
});

const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <>Loading...</>,
});

const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <>Loading...</>,
});

const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <>Loading...</>,
});

const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <>Loading...</>,
});

export interface FormProps {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
}

const forms: Record<string, React.ComponentType<any>> = {
  teacher: TeacherForm,
  student: StudentForm,
  parent: ParentForm,
  class: ClassForm,
  subject: SubjectForm,
  lesson: LessonForm,
  assignment: AssignmentForm,
  exam: ExamForm,
};

type FormModalProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number;
  onSuccess?: () => void;
};

const FormModal = ({
  table,
  type,
  data,
  id,
  onSuccess,
}: FormModalProps) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";

  const bgColor =
    type === "create"
      ? "bg-yellow-300"
      : type === "update"
      ? "bg-sky-300"
      : "bg-purple-300";

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const handleDelete = async () => {
    if (!id) return;

    try {
      setLoading(true);

      await deleteResource(table, id);

      showNotification(
        `${table} deleted successfully!`,
        "success"
      );

      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error(error);

      showNotification(
        error?.message ||
          `Failed to delete ${table}. Please try again.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const Form = () => {
    if (type === "delete" && id) {
      return (
        <div className="p-4 flex flex-col gap-4">
          <span className="text-center font-medium">
            All data will be lost. Are you sure you want to
            delete this {table}?
          </span>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      );
    }

    if (type === "create" || type === "update") {
      const FormComponent = forms[table];

      if (!FormComponent) {
        return (
          <p className="text-red-500">
            Form not implemented for {table}
          </p>
        );
      }

      return (
        <FormComponent
          type={type}
          data={data}
          onSuccess={() => {
            setOpen(false);
            onSuccess?.();
          }}
        />
      );
    }

    return <p className="text-red-500">Form not found!</p>;
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image
          src={`/${type}.png`}
          alt=""
          width={16}
          height={16}
        />
      </button>

      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />

            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image
                src="/close.png"
                alt="Close"
                width={14}
                height={14}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;