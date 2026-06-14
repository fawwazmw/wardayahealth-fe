import React from "react";
import { Form } from "antd";
import { useLogin, useRegister } from "@refinedev/core";
import { Link } from "react-router-dom";
import { HeartPulse, Mail, Lock, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full h-11 rounded-2xl border border-[#23443d] bg-[#10231f] px-3 text-sm text-[#edf6f3] placeholder:text-[#7f9790] focus:outline-none focus:ring-2 focus:ring-[#40c2a8] focus:border-transparent transition-all";

const labelClass = "block text-sm font-medium text-[#dceae6] mb-1.5";

const AuthLayout: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
  tagline: string;
}> = ({ title, subtitle, children, tagline }) => (
  <div
    className="flex min-h-screen"
    style={{
      background:
        "radial-gradient(circle at left top, rgba(64,194,168,0.16), transparent 28%), radial-gradient(circle at 86% 12%, rgba(215,179,91,0.12), transparent 18%), #081614",
    }}
  >
    <div
      className="hidden lg:flex flex-col justify-between p-12 w-[440px] flex-shrink-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(8,26,22,0.98) 0%, rgba(7,18,16,0.98) 100%)",
        borderRight: "1px solid rgba(33,56,51,0.9)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{
            width: 44,
            height: 44,
            background:
              "linear-gradient(135deg, rgba(64,194,168,1) 0%, rgba(35,140,126,1) 100%)",
            boxShadow: "0 12px 30px rgba(64,194,168,0.28)",
          }}
        >
          <HeartPulse size={20} color="white" />
        </div>
        <div>
          <div className="font-brand text-2xl font-bold leading-tight text-white">Wardayahealth</div>
          <div className="text-[11px] font-medium uppercase tracking-[0.24em]" style={{ color: "#8ca09a" }}>
            Care Operations
          </div>
        </div>
      </div>

      <div>
        <p className="font-brand mb-5 text-4xl font-semibold leading-[1.08] text-white">
          Calm systems.
          <br />
          Faster care.
          <br />
          <span style={{ color: "#40c2a8" }}>Clearer decisions.</span>
        </p>
        <p className="max-w-[28ch] text-sm leading-relaxed" style={{ color: "#8ca09a" }}>
          {tagline}
        </p>
      </div>

      <div className="space-y-3">
        <div
          className="rounded-2xl border px-4 py-3"
          style={{ borderColor: "#23443d", backgroundColor: "rgba(16,35,31,0.72)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "#10231f" }}>
              <HeartPulse size={16} style={{ color: "#40c2a8" }} />
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-white">Wardayahealth Suite</div>
              <div className="text-[11px]" style={{ color: "#8ca09a" }}>
                Clinical dashboard, diagnostics, and patient workflows
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#40c2a8" }} />
          <span className="text-[11px]" style={{ color: "#8ca09a" }}>
            Secure access · audit-ready workflows · clinic-first design
          </span>
        </div>
      </div>
    </div>

    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(64,194,168,1) 0%, rgba(35,140,126,1) 100%)",
            }}
          >
            <HeartPulse size={18} color="white" />
          </div>
          <span className="font-brand text-xl font-bold text-white">Wardayahealth</span>
        </div>

        <div
          className="rounded-[28px] p-8"
          style={{
            backgroundColor: "rgba(15,29,26,0.88)",
            border: "1px solid #23443d",
            boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
            backdropFilter: "blur(16px)",
          }}
        >
          <h1 className="font-brand mb-1 text-3xl font-bold text-white">{title}</h1>
          <p className="mb-6 text-sm text-[#8ca09a]">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  </div>
);

const SubmitButton: React.FC<{ loading: boolean; children: React.ReactNode }> = ({
  loading,
  children,
}) => (
  <button
    type="submit"
    disabled={loading}
    className={cn(
      "flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-medium text-white transition-all",
      loading ? "cursor-not-allowed opacity-70" : "hover:brightness-110 active:scale-[0.99]"
    )}
    style={{
      background:
        "linear-gradient(135deg, rgba(64,194,168,1) 0%, rgba(35,140,126,1) 100%)",
      boxShadow: "0 14px 28px rgba(64,194,168,0.24)",
    }}
  >
    {loading ? (
      <span className="flex items-center gap-2">
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Processing...
      </span>
    ) : (
      <>
        {children}
        <ArrowRight size={16} />
      </>
    )}
  </button>
);

export const Login = () => {
  const { mutate: login, isPending } = useLogin();

  const onFinish = (values: { email: string; password: string }) => {
    login(values);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Wardayahealth workspace"
      tagline="Manage patients, diagnostics, and reporting from one branded clinic operations hub."
    >
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <div style={{ marginBottom: 16 }}>
          <label className={labelClass}>Email address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#7f9790]" />
            <Form.Item
              name="email"
              noStyle
              rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
            >
              <input type="email" placeholder="you@example.com" className={cn(inputClass, "pl-9")} />
            </Form.Item>
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label className={labelClass}>Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#7f9790]" />
            <Form.Item name="password" noStyle rules={[{ required: true, message: "Please enter your password" }]}>
              <input type="password" placeholder="••••••••" className={cn(inputClass, "pl-9")} />
            </Form.Item>
          </div>
        </div>

        <div className="mb-6 flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium" style={{ color: "#40c2a8" }}>
            Forgot password?
          </Link>
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
          <SubmitButton loading={isPending}>Sign in</SubmitButton>
        </Form.Item>
      </Form>

      <p className="mt-6 text-center text-sm text-[#8ca09a]">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium" style={{ color: "#40c2a8" }}>
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export const Register = () => {
  const { mutate: register, isPending } = useRegister();

  const onFinish = (values: Record<string, string>) => {
    register(values);
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Get started with Wardayahealth"
      tagline="Bring clinicians, coordinators, and lab workflows into one calm, secure experience."
    >
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <div style={{ marginBottom: 14 }}>
          <label className={labelClass}>Full name</label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#7f9790]" />
            <Form.Item name="fullName" noStyle rules={[{ required: true, message: "Please enter your full name" }]}>
              <input placeholder="Dr. Jane Smith" className={cn(inputClass, "pl-9")} />
            </Form.Item>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className={labelClass}>Email address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#7f9790]" />
            <Form.Item
              name="email"
              noStyle
              rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
            >
              <input type="email" placeholder="you@clinic.com" className={cn(inputClass, "pl-9")} />
            </Form.Item>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className={labelClass}>Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#7f9790]" />
            <Form.Item
              name="password"
              noStyle
              rules={[{ required: true, message: "Please enter your password", min: 8 }]}
            >
              <input type="password" placeholder="Min. 8 characters" className={cn(inputClass, "pl-9")} />
            </Form.Item>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className={labelClass}>Confirm password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#7f9790]" />
            <Form.Item
              name="passwordConfirmation"
              noStyle
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) return Promise.resolve();
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <input type="password" placeholder="Repeat password" className={cn(inputClass, "pl-9")} />
            </Form.Item>
          </div>
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
          <SubmitButton loading={isPending}>Create account</SubmitButton>
        </Form.Item>
      </Form>

      <p className="mt-6 text-center text-sm text-[#8ca09a]">
        Already have an account?{" "}
        <Link to="/login" className="font-medium" style={{ color: "#40c2a8" }}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export const ForgotPassword = () => {
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const onFinish = (values: { email: string }) => {
    setSubmittedEmail(values.email);
    setSubmitted(true);
  };

  return (
    <AuthLayout
      title={submitted ? "Check your email" : "Reset your password"}
      subtitle={
        submitted
          ? `If an account exists for ${submittedEmail}, you will receive a password reset link shortly.`
          : "Enter your email and we will send you a reset link"
      }
      tagline="Account security is part of patient safety. We will help you regain access quickly and safely."
    >
      {submitted ? (
        <div>
          <div className="mb-6 rounded-2xl border border-[#8b6b28]/30 bg-[#8b6b28]/10 px-4 py-3 text-sm text-[#f1cf8d]">
            Password reset is not yet implemented. Please contact your administrator.
          </div>
          <Link
            to="/login"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-medium text-white transition-all hover:brightness-110"
            style={{
              background:
                "linear-gradient(135deg, rgba(64,194,168,1) 0%, rgba(35,140,126,1) 100%)",
            }}
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <div style={{ marginBottom: 20 }}>
            <label className={labelClass}>Email address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#7f9790]" />
              <Form.Item
                name="email"
                noStyle
                rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
              >
                <input type="email" placeholder="you@example.com" className={cn(inputClass, "pl-9")} />
              </Form.Item>
            </div>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <SubmitButton loading={false}>Send reset link</SubmitButton>
          </Form.Item>
        </Form>
      )}

      <p className="mt-6 text-center text-sm text-[#8ca09a]">
        <Link to="/login" className="font-medium" style={{ color: "#40c2a8" }}>
          ← Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
