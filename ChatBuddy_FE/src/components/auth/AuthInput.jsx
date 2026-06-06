export default function AuthInput({
    name,
    type,
    placeholder,
    register,
    error,
  }) {
    return (
      <div className="mt-6 flex flex-col space-y-2">
        <label htmlFor={name} className="text-xs font-semibold uppercase tracking-wider dark:text-dark_text_2">
          {placeholder}
        </label>
        <input
          className="w-full dark:bg-dark_bg_3/60 dark:text-dark_text_1 text-sm py-3 px-4 rounded-xl border border-dark_border_1 focus:border-green_1 focus:ring-2 focus:ring-green_1/20 transition-all duration-300 outline-none placeholder-dark_text_3"
          type={type}
          placeholder={`Enter your ${placeholder.toLowerCase()}`}
          {...register(name)}
        />
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }