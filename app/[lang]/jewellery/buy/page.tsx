import { journeyPage } from "@/components/home/JourneyPages";

const page = journeyPage("jewellery", "buy");
export const generateMetadata = page.generateMetadata;
export default page.Page;
