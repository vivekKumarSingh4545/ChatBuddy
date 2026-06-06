import { useDispatch } from "react-redux";
import { logout } from "../../../features/userSlice";
import { clearChatState } from "../../../features/chatSlice";

export default function Menu() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearChatState());
  };

  return (
    <div className="absolute right-1 mt-2 z-50 dark:bg-dark_bg_3 border border-dark_border_1 shadow-2xl rounded-xl w-40 py-1.5 backdrop-blur-md bg-opacity-95 select-none animate-fadeIn">
      <ul className="flex flex-col">
        <li
          className="px-4 py-2.5 text-sm cursor-pointer hover:bg-red-500/10 text-rose-500 font-medium transition duration-150"
          onClick={handleLogout}
        >
          <span>Log Out</span>
        </li>
      </ul>
    </div>
  );
}