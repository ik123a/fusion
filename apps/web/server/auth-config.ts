function configured(value: string | undefined) {
  return !!value && !value.endsWith("_here");
}

export function hasClerkKeys() {
  return configured(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
    && configured(process.env.CLERK_SECRET_KEY);
}

export function isDemoMode() {
  return process.env.NODE_ENV === "development"
    && process.env.FUSION_USE_MOCK_DB === "1"
    && !configured(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
    && !configured(process.env.CLERK_SECRET_KEY);
}
