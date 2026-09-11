import { redirect } from "next/navigation";
import { PRODUCTS } from "@/data/products";

export default function Home() {
  redirect("/" + PRODUCTS[0].slug);
}
