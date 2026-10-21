import { journeyPage } from "@/components/home/JourneyPages";

const page = journeyPage("jewellery", "sell");
export const generateMetadata = page.generateMetadata;
export default page.Page;
