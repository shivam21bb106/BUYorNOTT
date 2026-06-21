export function RatingGroup({ label, value, onChange, captions }) {
  return (
    <div className="field">
      <span>{label}</span>
      <div className="rating-grid">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            className={Number(value) === rating ? 'rating selected' : 'rating'}
            key={rating}
            onClick={() => onChange(rating)}
            type="button"
          >
            <strong>{rating}</strong>
            <small>{captions[rating - 1]}</small>
          </button>
        ))}
      </div>
    </div>
  )
}
