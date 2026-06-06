import moment from "moment";
import { BeatLoader } from "react-spinners";
import TraingleIcon from "../../../svgs/triangle";
export default function Typing({ message }) {
  return (
    <div className="w-full flex mt-3 justify-start">
      <div className="relative max-w-[75%] py-3.5 px-5 rounded-2xl rounded-tl-none shadow-sm dark:bg-dark_bg_2 border border-dark_border_1/20 dark:text-dark_text_1 flex items-center justify-center">
        {/*Typing animation*/}
        <BeatLoader color="#6366F1" size={8} margin={2} />
      </div>
    </div>
  );
}