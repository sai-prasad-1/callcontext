import AuthLayout from "@/components/layout/AuthLayout";

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
