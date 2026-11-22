import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { isAdminQuery, profileQuery } from "@/lib/queries";
import AppLayout from "@/components/AppLayout";
import { PageSpinner } from "@/components/PageSpinner";

// The session lives in browser storage, so this gate runs client-side only.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { user: data.user };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(profileQuery(context.user.id)),
      context.queryClient.ensureQueryData(isAdminQuery(context.user.id)),
    ]);
  },
  pendingComponent: PageSpinner,
  component: AppLayout,
});
