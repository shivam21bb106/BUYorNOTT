export function NumberField({ label, value, onChange, min = 0, suffix }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        <input
          min={min}
          onChange={(event) => onChange(event.target.value)}
          type="number"
          value={value}
        />
        {suffix ? <small>{suffix}</small> : null}
      </div>
    </label>
  )
}
