export * from "./auth.api";
export * from "./student.api";
export * from "./class.api";

import { deleteStudent } from "./student.api";

export async function deleteResource(table: string, id: number) {
  switch (table) {
    case "student":
      return deleteStudent(id);

    default:
      throw new Error(`Delete not implemented for ${table}`);
  }
}