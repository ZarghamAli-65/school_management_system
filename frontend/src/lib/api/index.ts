import { deleteClass } from "./class.api";
import { deleteParent } from "./parent.api";
import { deleteStudent } from "./student.api";
import { deleteTeacher } from "./teacher.api";

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

    default:
      throw new Error(`Delete not implemented for ${table}`);
  }
}