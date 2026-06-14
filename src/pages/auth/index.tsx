import React from "react";
import { Form } from "antd";
import { useLogin, useRegister } from "@refinedev/core";
import { Link } from "react-router-dom";
import { FlaskConical, Mail, Lock, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full h-10 rounded-lg border border-[#2a2d35] bg-[#1a1d23] px-3 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#e91e8c] focus:border-transparent transition-all";

const inputClassLight =
  "w-full h-10 rounded-lg border border-[#e5e5e5] bg-[#f9fafb] px-3 text-sm text-[#0d0d0d] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#e91e8c] focus:border-transparent transition-all";

const labelClass = "block text-sm font-medium text-[#d1d5db] mb-1.5";
const labelClassLight = "block text-sm font-medium text-[#374151] mb-1.5";

const AuthLayout: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
  tagline: string;
}> = ({ title, subtitle, children, tagline }) => (
  <div className="flex min-h-screen">
    <div
      className="hidden lg:flex flex-col justify-between p-12 w-[440px] flex-shrink-0"
      style={{ backgroundColor: "#0d0f12" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 40, height: 40, backgroundColor: "#e91e8c" }}
        >
          <FlaskConical size={20} color="white" />
        </div>
        <div>
          <div className="text-white font-bold text-lg leading-tight">mirLung Dx™</div>
          <div className="text-[11px] font-medium tracking-widest uppercase" style={{ color: "#6b7280" }}>
            Clinical Prototype
          </div>
        </div>
      </div>

      <div>
        <p className="text-3xl font-semibold text-white leading-snug mb-4">
          Precision Health.<br />
          Empowered by<br />
          <span style={{ color: "#e91e8c" }}>miRNA.</span>
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "#6b7280" }}>
          {tagline}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1a1d23" }}>
            <FlaskConical size={14} style={{ color: "#e91e8c" }} />
          </div>
          <div>
            <div className="text-xs font-medium text-white">mirLung Dx™ v2.4</div>
            <div className="text-[10px]" style={{ color: "#6b7280" }}>Lung Nodule Risk Stratification</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#22c55e" }} />
          <span className="text-[11px]" style={{ color: "#6b7280" }}>
            Secure · HIPAA Compliant · ISO 13485
          </span>
        </div>
      </div>
    </div>

    <div className="flex flex-1 items-center justify-center px-6 py-12" style={{ backgroundColor: "#13151a" }}>
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 36, height: 36, backgroundColor: "#e91e8c" }}
          >
            <FlaskConical size={18} color="white" />
          </div>
          <span className="font-bold text-lg text-white">mirLung Dx™</span>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ backgroundColor: "#1a1d23", border: "1px solid #2a2d35" }}
        >
          <h1 className="text-xl font-bold text-white mb-1">{title}</h1>
          <p className="text-sm text-[#6b7280] mb-6">{subtitle}</p>
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
      "w-full h-10 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-2",
      loading ? "opacity-70 cursor-not-allowed" : "hover:brightness-110 active:scale-[0.99]"
    )}
    style={{ backgroundColor: "#e91e8c" }}
  >
    {loading ? (
      <span className="flex items-center gap-2">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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
      subtitle="Sign in to your mirLung Dx™ account"
      tagline="Manage lab tests, generate diagnostic reports, and track patient risk scores — all from one platform."
    >
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <div style={{ marginBottom: 16 }}>
          <label className={labelClass}>Email address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] z-10" />
            <Form.Item name="email" noStyle rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}>
              <input type="email" placeholder="you@example.com" className={cn(inputClass, "pl-9")} />
            </Form.Item>
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label className={labelClass}>Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] z-10" />
            <Form.Item name="password" noStyle rules={[{ required: true, message: "Please enter your password" }]}>
              <input type="password" placeholder="••••••••" className={cn(inputClass, "pl-9")} />
            </Form.Item>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <Link to="/forgot-password" className="text-sm font-medium" style={{ color: "#e91e8c" }}>
            Forgot password?
          </Link>
        </div>

        <Form.Item style={{ marginBottom: 0 }}>
          <SubmitButton loading={isPending}>Sign in</SubmitButton>
        </Form.Item>
      </Form>

      <p className="text-center text-sm text-[#6b7280] mt-6">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium" style={{ color: "#e91e8c" }}>
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
      subtitle="Get started with mirLung Dx™"
      tagline="Join healthcare professionals using mirLung Dx™ to streamline diagnostic workflows and improve patient outcomes."
    >
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <div style={{ marginBottom: 14 }}>
          <label className={labelClass}>Full name</label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] z-10" />
            <Form.Item name="fullName" noStyle rules={[{ required: true, message: "Please enter your full name" }]}>
              <input placeholder="Dr. Jane Smith" className={cn(inputClass, "pl-9")} />
            </Form.Item>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className={labelClass}>Email address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] z-10" />
            <Form.Item name="email" noStyle rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}>
              <input type="email" placeholder="you@hospital.com" className={cn(inputClass, "pl-9")} />
            </Form.Item>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className={labelClass}>Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] z-10" />
            <Form.Item name="password" noStyle rules={[{ required: true, message: "Please enter your password", min: 8 }]}>
              <input type="password" placeholder="Min. 8 characters" className={cn(inputClass, "pl-9")} />
            </Form.Item>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className={labelClass}>Confirm password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] z-10" />
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

      <p className="text-center text-sm text-[#6b7280] mt-6">
        Already have an account?{" "}
        <Link to="/login" className="font-medium" style={{ color: "#e91e8c" }}>
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
          : "Enter your email and we'll send you a reset link"
      }
      tagline="Account security is our priority. We'll help you regain access quickly and safely."
    >
      {submitted ? (
        <div>
          <div className="rounded-lg border border-[#854d0e]/30 bg-[#854d0e]/10 px-4 py-3 text-sm text-[#fbbf24] mb-6">
            Password reset is not yet implemented. Please contact your administrator.
          </div>
          <Link
            to="/login"
            className="w-full h-10 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            style={{ backgroundColor: "#e91e8c" }}
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <div style={{ marginBottom: 20 }}>
            <label className={labelClass}>Email address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] z-10" />
              <Form.Item name="email" noStyle rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}>
                <input type="email" placeholder="you@example.com" className={cn(inputClass, "pl-9")} />
              </Form.Item>
            </div>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <SubmitButton loading={false}>Send reset link</SubmitButton>
          </Form.Item>
        </Form>
      )}

      <p className="text-center text-sm text-[#6b7280] mt-6">
        <Link to="/login" className="font-medium" style={{ color: "#e91e8c" }}>
          ← Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
