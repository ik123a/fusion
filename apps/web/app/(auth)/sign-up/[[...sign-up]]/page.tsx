"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center w-full">
      <SignUp
        routing="path"
        path="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "mx-auto w-full",
            card: "bg-transparent border-0 shadow-none",
            headerTitle: "text-foreground font-bold",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "bg-secondary/40 border-border/40 hover:bg-secondary/60 text-foreground transition-all",
            formFieldLabel: "text-foreground/90 font-medium",
            formFieldInput: "bg-secondary/25 border-border/45 text-foreground focus:border-indigo-500 focus:ring-0",
            formButtonPrimary: "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md",
            footerActionText: "text-muted-foreground",
            footerActionLink: "text-indigo-400 hover:text-indigo-300 font-semibold",
          },
        }}
      />
    </div>
  );
}
