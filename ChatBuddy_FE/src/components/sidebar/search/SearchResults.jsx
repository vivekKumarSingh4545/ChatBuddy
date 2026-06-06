import Contact from "./Contact";

export default function SearchResults({ searchResults, setSearchResults }) {
  return (
    <div className="w-full convos scrollbar">
      <div>
        {/*Heading*/}
        <div className="flex items-center px-4 py-3 border-b border-dark_border_1 select-none dark:bg-dark_bg_3/20">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-green_1">Contacts</h2>
        </div>
        {/*Results*/}
        <ul>
          {searchResults &&
            searchResults.map((user) => (
              <Contact
                contact={user}
                key={user._id}
                setSearchResults={setSearchResults}
              />
            ))}
        </ul>
      </div>
    </div>
  );
}