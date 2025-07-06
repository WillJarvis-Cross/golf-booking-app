import React from "react";

interface NumberFieldProps {
  label: string;
  name: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

const NumberField: React.FC<NumberFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  required = false,
}) => {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <input
        type="number"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        required={required}
        className="form-control"
      />
    </div>
  );
};

export default NumberField;
