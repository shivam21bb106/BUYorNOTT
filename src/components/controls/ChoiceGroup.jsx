export function ChoiceGroup({ label, options, value, onChange }) {
  return (
    <div className="field">
      <span>{label}</span>
      <div className="choice-grid">
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label

          return (
            <button
              className={value === optionValue ? 'choice selected' : 'choice'}
              key={optionValue}
              onClick={() => onChange(optionValue)}
              type="button"
            >
              {optionLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}
