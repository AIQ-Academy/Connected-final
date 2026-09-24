import { redirect } from "next/navigation";

/** Trading Academy is retired; the Learn surface is the glossary. */
export default function EducationRedirect() {
  redirect("/glossary");
}
