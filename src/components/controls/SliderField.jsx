import { clamp } from '../../utils/numberFormat'

export function SliderField({ label, value, min, max, suffix = '', onChange, hint }) {
  const progress = ((Number(value) - min) / (max - min)) * 100

  return (
    <div
      className="slider-field"
      style={{ '--range-progress': `${clamp(progress, 0, 100)}%` }}
    >
      <div>
        <span>{label}</span>
        <strong>
          {value}
          {suffix}
        </strong>
      </div>
      <input
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
      {hint ? <p>{hint}</p> : null}
    </div>
  )
}
