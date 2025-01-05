"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";

import { applyActionCode } from "firebase/auth";
import { useEffect, useState } from "react";

const LogIn = () => {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(
    "Processing email verification..."
  );

  useEffect(() => {
    const handleEmailVerification = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get("mode");
      const oobCode = urlParams.get("oobCode");

      if (mode === "signIn" && oobCode) {
        try {
          // Aplicar el código de acción para verificar el correo
          await applyActionCode(auth, oobCode);
          setMessage("Email verified successfully! You can now log in.");
          // Redirige al login o dashboard
          router.push("/login");
        } catch (error) {
          console.error("Error verifying email:", error);
          setMessage(
            "Failed to verify email. The link may be expired or already used."
          );
        }
      }
    };

    handleEmailVerification();
  }, [router]);
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      try {
        console.log(values);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        const results = userCredential.user;
        console.log(results);
        if (!results.emailVerified) {
          alert("El correo no esta verificado");
          return;
        }
        router.push("/dashboard");
      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <Label>Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
        />
        <Label>Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
        />
        <Button type="submit">Iniciar sesión</Button>
      </form>
    </div>
  );
};

export default LogIn;
