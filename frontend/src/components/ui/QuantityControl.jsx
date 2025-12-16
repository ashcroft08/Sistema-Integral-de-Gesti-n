import React, { useState, useEffect } from "react";

const QuantityControl = ({ quantity, onChange, min = 1, max }) => {
  const [inputValue, setInputValue] = useState(quantity);

  useEffect(() => {
    setInputValue(quantity);
  }, [quantity]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Only update parent if it's a valid number
    if (value !== "") {
      const numVal = parseInt(value, 10);
      if (!isNaN(numVal) && numVal >= min) {
        onChange(numVal);
      }
    }
  };

  const handleBlur = () => {
    // On blur, if empty or invalid, revert to prop quantity
    if (inputValue === "" || isNaN(parseInt(inputValue, 10))) {
      setInputValue(quantity);
    } else {
        // Ensure consistent formatting on blur
        setInputValue(parseInt(inputValue, 10));
    }
  };

  return (
    <div className="flex items-center border border-primary/20 rounded-lg">
      <button
        onClick={() => onChange(quantity - 1)}
        className="p-1 hover:bg-primary/5 disabled:opacity-50"
        disabled={quantity <= min}
      >
        <span className="material-symbols-outlined text-sm">remove</span>
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="w-12 text-center text-xs font-semibold border-none bg-transparent focus:ring-0 p-0 appearance-none"
      />
      <button
        onClick={() => onChange(quantity + 1)}
        className="p-1 hover:bg-primary/5 disabled:opacity-50"
        disabled={max ? quantity >= max : false}
      >
        <span className="material-symbols-outlined text-sm">add</span>
      </button>
    </div>
  );
};

export default QuantityControl;
