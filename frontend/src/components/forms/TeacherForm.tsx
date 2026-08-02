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

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),

  email: z.string().email("Invalid email address"),

  firstName: z.string().min(1, "First name is required"),

  lastName: z.string().min(1, "Last name is required"),

  phone: z.string().optional(),

  address: z.string().optional(),

  bloodType: z.string().min(1, "Blood type is required"),

  birthday: z.string().min(1, "Birthday is required"),

  gender: z.enum(["MALE", "FEMALE"]),

  photo: z.string().optional(),
});


type Inputs = z.infer<typeof schema>;


type TeacherFormProps = {
  type: "create" | "update";
  data?: any;
  onSuccess?: () => void;
};


const TeacherForm = ({
  type,
  data,
  onSuccess,
}: TeacherFormProps) => {


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

      username: data?.username || "",

      email: data?.email || "",


      firstName: data?.firstName || "",

      lastName: data?.lastName || "",


      phone: data?.phone || "",

      address: data?.address || "",


      bloodType: data?.bloodType || "",


      birthday: data?.birthday
        ? data.birthday.split("T")[0]
        : "",


      gender: data?.gender || "MALE",


      photo: data?.photo || "",

    },

  });



  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];


    if (file) {

      const reader = new FileReader();


      reader.onloadend = () => {

        setValue(
          "photo",
          reader.result as string
        );

      };


      reader.readAsDataURL(file);

    }

  };



  const onSubmit = handleSubmit(async (formData) => {


    try {

      setLoading(true);



      const payload = {

        teacherId: formData.teacherId,

        username: formData.username,

        email: formData.email,


        firstName: formData.firstName,

        lastName: formData.lastName,


        phone: formData.phone || "",

        address: formData.address || "",


        bloodType: formData.bloodType,


        birthday: new Date(
          formData.birthday
        ).toISOString(),


        gender: formData.gender,


        photo: formData.photo || "",

      };



      if (type === "create") {


        await createTeacher(payload);


        showNotification(
          "Teacher created successfully",
          "success"
        );


      } else {


        await updateTeacher(
          data.id,
          payload
        );


        showNotification(
          "Teacher updated successfully",
          "success"
        );


      }



      onSuccess?.();



    } catch (error: any) {


      console.error(error);


      showNotification(
        error?.message ||
        `Failed to ${type} teacher`,
        "error"
      );


    } finally {


      setLoading(false);


    }


  });




  return (

    <form
      className="flex flex-col gap-8"
      onSubmit={onSubmit}
    >


      <h1 className="text-xl font-semibold">

        {type === "create"
          ? "Create a new teacher"
          : "Update teacher"}

      </h1>



      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>



      <div className="flex justify-between flex-wrap gap-4">


        <InputField
          label="Teacher ID"
          name="teacherId"
          defaultValue={data?.teacherId}
          register={register}
          error={errors.teacherId}
        />


        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors.username}
        />


        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors.email}
        />


      </div>



      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>



      <div className="flex justify-between flex-wrap gap-4">



        <InputField
          label="First Name"
          name="firstName"
          defaultValue={data?.firstName}
          register={register}
          error={errors.firstName}
        />



        <InputField
          label="Last Name"
          name="lastName"
          defaultValue={data?.lastName}
          register={register}
          error={errors.lastName}
        />



        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />



        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />



        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />



        <InputField
          label="Birthday"
          name="birthday"
          type="date"
          defaultValue={
            data?.birthday
              ? data.birthday.split("T")[0]
              : ""
          }
          register={register}
          error={errors.birthday}
        />



        <div className="flex flex-col gap-2 w-full md:w-1/4">

          <label className="text-xs text-gray-500">
            Gender
          </label>


          <select
            {...register("gender")}
            defaultValue={data?.gender || "MALE"}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
          >

            <option value="MALE">
              Male
            </option>


            <option value="FEMALE">
              Female
            </option>


          </select>


        </div>



        <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">


          <label
            htmlFor="img"
            className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
          >

            <Image
              src="/upload.png"
              alt=""
              width={28}
              height={28}
            />

            Upload photo

          </label>



          <input
            id="img"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />


        </div>



      </div>



      <button
        disabled={loading}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-50"
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