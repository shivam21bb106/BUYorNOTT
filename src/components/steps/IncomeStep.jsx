import { currencyOptions } from '../../constants/appData'
import { NumberField } from '../controls/NumberField'
import { SliderField } from '../controls/SliderField'
import { formatMoney } from '../../utils/numberFormat'
import { getHourlyValue, getMonthlySavings } from '../../utils/scoring'

export function IncomeStep({ income, setIncome, onNext }) {
  const monthlySavings = getMonthlySavings(income)
  const hourlyValue = getHourlyValue(income)

  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <p className="eyebrow">Step 1</p>
        <h2>First, your money rhythm</h2>
        <p>
          No judgment here. We just need enough context to turn a price tag
          into actual hours, weeks, and breathing room.
        </p>
      </div>

      <div className="form-grid two-col">
        <label className="field">
          <span>Currency</span>
          <select
            onChange={(event) =>
              setIncome((current) => ({
                ...current,
                currency: event.target.value,
              }))
            }
            value={income.currency}
          >
            {currencyOptions.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} {currency.symbol}
              </option>
            ))}
          </select>
        </label>
        <NumberField
          label="Monthly income"
          onChange={(value) =>
            setIncome((current) => ({ ...current, monthlyIncome: value }))
          }
          value={income.monthlyIncome}
        />
      </div>

      <SliderField
        hint="This is the money you can spend without bullying next month."
        label="Savings percentage"
        max={80}
        min={0}
        onChange={(value) =>
          setIncome((current) => ({
            ...current,
            savingsPercentage: value,
          }))
        }
        suffix="%"
        value={income.savingsPercentage}
      />

      <div className="form-grid two-col">
        <SliderField
          label="Hours per day"
          max={14}
          min={1}
          onChange={(value) =>
            setIncome((current) => ({
              ...current,
              workHoursPerDay: value,
            }))
          }
          value={income.workHoursPerDay}
        />
        <SliderField
          label="Days per week"
          max={7}
          min={1}
          onChange={(value) =>
            setIncome((current) => ({
              ...current,
              workDaysPerWeek: value,
            }))
          }
          value={income.workDaysPerWeek}
        />
      </div>

      <div className="insight-strip">
        <div>
          <span>Monthly savings</span>
          <strong>{formatMoney(monthlySavings, income.currency)}</strong>
        </div>
        <div>
          <span>Estimated hourly value</span>
          <strong>{formatMoney(hourlyValue, income.currency)}</strong>
        </div>
      </div>

      <div className="actions right">
        <button className="primary" onClick={onNext} type="button">
          Next, judge the item
        </button>
      </div>
    </section>
  )
}
