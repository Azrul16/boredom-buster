import LocalProgress from "@/components/LocalProgress";
export const metadata = {
  title: "Your local records",
  alternates: { canonical: "/progress/" },
};
export default function ProgressPage() {
  return <LocalProgress />;
}
