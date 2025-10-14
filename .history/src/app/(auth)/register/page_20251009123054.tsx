"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const FormSchema = z
  .object({
    inviteCode: z.string().min(3),
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof FormSchema>>({ resolver: zodResolver(FormSchema) });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      router.replace("/login");
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Registration failed");
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Invite Code</label>
          <input className="input" {...register("inviteCode")} />
          {errors.inviteCode && (
            <p className="text-red-600 text-sm">{errors.inviteCode.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" className="input" {...register("email")} />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input className="input" {...register("username")} />
          {errors.username && (
            <p className="text-red-600 text-sm">{errors.username.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" className="input" {...register("password")} />
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">Confirm Password</label>
          <input type="password" className="input" {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button disabled={isSubmitting} className="btn w-full">Create account</button>
        <p className="text-sm text-center">
          Already have an account? <a className="underline" href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}


