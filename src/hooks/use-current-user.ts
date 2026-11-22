import { getRouteApi } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { isAdminQuery, profileQuery } from "@/lib/queries";

const authedRoute = getRouteApi("/_authenticated");

/** Signed-in user, their profile and admin flag. Only usable under the /_authenticated layout. */
export function useCurrentUser() {
  const { user } = authedRoute.useRouteContext();
  const { data: profile } = useSuspenseQuery(profileQuery(user.id));
  const { data: isAdmin } = useSuspenseQuery(isAdminQuery(user.id));
  return { user, profile, isAdmin };
}
