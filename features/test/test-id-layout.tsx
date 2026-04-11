"use client";

import { Allotment } from "allotment";
import { Navbar } from "./nav-bar";
import { ConversationSidebar } from "../conversation/conversation-side-bar";

// import { ConversationSidebar } from "@/features/conversations/components/conversation-sidebar";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 800;
const DEFAULT_CONVERSATION_SIDEBAR_WIDTH = 400;
const DEFAULT_MAIN_SIZE = 1000;

export default function TestIdLayout({
  children,
  testId,
}: {
  children: React.ReactNode;
  testId: string;
}) {
  return (
    <div className="w-full h-screen flex flex-col">
      <Navbar testId={testId} />
      <div className="flex-1 flex overflow-hidden">
        <Allotment
          className="flex-1"
          defaultSizes={[DEFAULT_CONVERSATION_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}
        >
          <Allotment.Pane
            snap
            minSize={MIN_SIDEBAR_WIDTH}
            maxSize={MAX_SIDEBAR_WIDTH}
            preferredSize={DEFAULT_CONVERSATION_SIDEBAR_WIDTH}
          >
            <ConversationSidebar testId={testId} />
          </Allotment.Pane>
          <Allotment.Pane>{children}</Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
};
