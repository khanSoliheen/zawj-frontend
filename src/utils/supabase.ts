// Supabase has been removed from the runtime app in favor of the Rust backend.
// This module remains only so existing tests can mock the old path without failing
// module resolution.
export const supabase = new Proxy(
  {},
  {
    get() {
      throw new Error('Supabase client has been removed. Use the Rust API services instead.');
    },
  },
) as Record<string, never>;
