import TestIdLayout from "@/features/test/test-id-layout";

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ testId: string }>;
}) => {
  const { testId } = await params;

  return <TestIdLayout testId={testId}>{children}</TestIdLayout>;
};

export default Layout;
