import { ClerkProvider } from "@clerk/nextjs";

interface OptionalClerkProviderProps {
  children: React.ReactNode;
}

export function OptionalClerkProvider({ children }: OptionalClerkProviderProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return <>{children}</>;
  }

  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}
