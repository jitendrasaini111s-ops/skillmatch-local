import { Spinner } from "@/components/app-ui";

export function PageSpinner() {
  return (
    <div className="flex justify-center py-16">
      <Spinner className="h-8 w-8 text-primary" />
    </div>
  );
}
