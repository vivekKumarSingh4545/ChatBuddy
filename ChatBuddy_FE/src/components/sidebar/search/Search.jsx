import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { FilterIcon, ReturnIcon, SearchIcon } from "../../../svgs";

export default function Search({ searchLength, setSearchResults }) {
  const { user } = useSelector((state) => state.user);
  const { token } = user;
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      if (query) {
        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_API_ENDPOINT}/user?search=${query}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setSearchResults(data);
        } catch (error) {
          console.log(error.response.data.error.message);
        }
      } else {
        setSearchResults([]);
      }
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val) {
      setSearchResults([]);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSearchResults([]);
    setShow(false);
  };

  return (
    <div className="h-[52px] flex items-center px-3 select-none">
      {/*Container*/}
      <div className="w-full">
        {/*Search input container*/}
        <div className="flex items-center gap-x-2">
          <div className="w-full flex items-center dark:bg-dark_bg_3/60 border border-dark_border_1 focus-within:border-green_1 focus-within:ring-2 focus-within:ring-green_1/20 transition-all duration-300 rounded-xl px-2 py-1">
            {show || searchLength > 0 || query ? (
              <span
                className="w-8 flex items-center justify-center rotateAnimation cursor-pointer text-green_1"
                onClick={handleClear}
              >
                <ReturnIcon className="fill-green_1 w-4" />
              </span>
            ) : (
              <span className="w-8 flex items-center justify-center text-dark_svg_2">
                <SearchIcon className="dark:fill-dark_svg_2 w-4" />
              </span>
            )}
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full bg-transparent text-sm py-1.5 dark:text-dark_text_1 outline-none placeholder-dark_text_3 flex-1"
              value={query}
              onChange={handleChange}
              onFocus={() => setShow(true)}
              onBlur={() => searchLength == 0 && !query && setShow(false)}
              onKeyDown={(e) => handleSearch(e)}
            />
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl dark:bg-dark_bg_3/60 hover:bg-dark_hover_1 border border-dark_border_1 text-dark_svg_2 hover:text-dark_text_1 transition duration-200">
            <FilterIcon className="dark:fill-dark_svg_2 w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}