import { journeyPage } from "@/components/home/JourneyPages";

const page = journeyPage("diamond", "buy");
export const generateMetadata = page.generateMetadata;
export default page.Page;
