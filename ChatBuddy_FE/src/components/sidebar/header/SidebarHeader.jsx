import { useSelector } from "react-redux";
import { DotsIcon } from "../../../svgs";
import { useState } from "react";
import Menu from "./Menu";

export default function SidebarHeader() {
  const { user } = useSelector((state) => state.user);
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className="h-[50px] dark:bg-dark_bg_2 border-b border-dark_border_1 flex items-center p16 select-none">
      {/* container */}
      <div className="w-full flex items-center justify-between">
        {/*user image*/}
        <div className="flex items-center gap-x-2">
          <button className="w-9 h-9 rounded-full overflow-hidden border-2 border-dark_border_2 hover:border-green_1 transition duration-300">
            <img
              src={user.picture}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </button>
          <span className="text-sm font-semibold dark:text-dark_text_1 hidden md:block">
            Chats
          </span>
        </div>
        {/*user icons*/}
        <ul className="flex items-center gap-x-1">
          <li className="relative" onClick={() => setShowMenu((prev) => !prev)}>
            <button className={`btn ${showMenu ? "bg-dark_hover_1 text-dark_text_1" : "text-dark_svg_1 hover:bg-dark_hover_1"} transition duration-200`}>
              <DotsIcon className="dark:fill-dark_svg_1 w-5 h-5" />
            </button>
            {showMenu ? <Menu /> : null}
          </li>
        </ul>
      </div>
    </div>
  );
}