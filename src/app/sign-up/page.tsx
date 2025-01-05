"use client";
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
} from "firebase/auth";
import { useFormik } from "formik";
import { auth } from "../firebase";
import { Label } from "@radix-ui/react-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const actionCodeSettings = {
  url: "http://localhost:3000/log-in",
  handleCodeInApp: true,
};

const SignUp = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      setErrorMessage(null); // Reset error message on submit
      try {
        const resultUser = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        console.log(resultUser);

        await sendSignInLinkToEmail(auth, values.email, actionCodeSettings);
        // window.localStorage.setItem("emailForSignIn", values.email);
        alert("Registration successful! Check your email for verification.");
      } catch (error: any) {
        // Handle errors
        if (error.code === "auth/email-already-in-use") {
          setErrorMessage("This email is already in use. Please try logging in.");
        } else if (error.code === "auth/weak-password") {
          setErrorMessage("Password should be at least 6 characters long.");
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
        console.error(error);
      }
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
        />
        <label htmlFor="password">Contraseña</label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={6}
          value={formik.values.password}
          onChange={formik.handleChange}
        />
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <Button type="submit">Registrarse</Button>
      </form>
    </div>
  );
};

export default SignUp;
