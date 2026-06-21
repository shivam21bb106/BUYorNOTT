const steps = ['Money', 'Item', 'Verdict']

export function StepIndicator({ activeStep }) {
  return (
    <div className="stepper" aria-label="Progress">
      {steps.map((step, index) => (
        <div
          className={`step ${activeStep === index + 1 ? 'active' : ''} ${
            activeStep > index + 1 ? 'complete' : ''
          }`}
          key={step}
        >
          <span>{index + 1}</span>
          {step}
        </div>
      ))}
    </div>
  )
}
