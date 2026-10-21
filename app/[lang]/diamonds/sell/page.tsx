import { journeyPage } from "@/components/home/JourneyPages";

const page = journeyPage("diamond", "sell");
export const generateMetadata = page.generateMetadata;
export default page.Page;
