import { deleteAnnouncement } from "./announcement.api";
import { deleteClass } from "./class.api";
import { deleteLesson } from "./classSchedule.api";
import { deleteParent } from "./parent.api";
import { deleteStudent } from "./student.api";
import { deleteSubject } from "./subject.api";
import { deleteTeacher } from "./teacher.api";

export {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "./student.api";

export {
  getParents,
  createParent,
  updateParent,
  deleteParent,
} from "./parent.api";

export {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "./teacher.api";

export {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
} from "./class.api";

export {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "./subject.api";

export {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
} from "./classSchedule.api";

export {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "./announcement.api";

export async function deleteResource(table: string, id: number) {
  switch (table) {
    case "student":
      return deleteStudent(id);

    case "teacher":
      return deleteTeacher(id);

    case "parent":
      return deleteParent(id);

    case "class":
      return deleteClass(id);

    case "subject":
      return deleteSubject(id);

    case "lesson":
      return deleteLesson(id);

    case "announcement":
      return deleteAnnouncement(id);

    default:
      throw new Error(`Delete not implemented for ${table}`);
  }
}