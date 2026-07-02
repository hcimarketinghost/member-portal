"use client";

/**
 * Search input — owns `.hp-search-field`. Works uncontrolled (default) or
 * controlled via `value` + `onChange`.
 */
export default function SearchField({
  placeholder = "Search HCI",
  defaultValue,
  value,
  onChange,
  name = "q",
}: {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
}) {
  return (
    <label className="hp-search-field">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m15.5 15.5 4 4M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" />
      </svg>
      <input
        type="search"
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </label>
  );
}
