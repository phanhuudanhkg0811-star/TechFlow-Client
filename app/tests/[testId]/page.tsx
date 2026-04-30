import TestIdView from "@/features/test/test-id-view";

const TestIdPage = async ({ params }: { params: Promise<{ testId: string }> }) => {
  const { testId } = await params;

  return <TestIdView testId={testId} />;
};

export default TestIdPage;
