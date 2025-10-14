"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof FormSchema>>({ resolver: zodResolver(FormSchema) });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const { error } = await supabase.auth.signInWithPassword(values);
    if (!error) router.replace("/");
    else alert(error.message);
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" className="input" {...register("email")} />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" className="input" {...register("password")} />
          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password.message}</p>
          )}
        </div>
        <button disabled={isSubmitting} className="btn w-full">Sign in</button>
        <p className="text-sm text-center">
          No account? <a className="underline" href="/register">Register</a>
        </p>
      </form>
    </div>
  );
}


