import { purchaseTypes, usageOptions } from '../../constants/appData'
import { ChoiceGroup } from '../controls/ChoiceGroup'
import { NumberField } from '../controls/NumberField'
import { RatingGroup } from '../controls/RatingGroup'

export function PurchaseStep({ purchase, setPurchase, onBack, onCalculate }) {
  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <p className="eyebrow">Step 2</p>
        <h2>Now, the thing you want</h2>
        <p>
          Be honest with yourself here. Is this a real upgrade, or just a shiny
          little dopamine trap?
        </p>
      </div>

      <label className="field">
        <span>Item name</span>
        <input
          onChange={(event) =>
            setPurchase((current) => ({
              ...current,
              itemName: event.target.value,
            }))
          }
          placeholder="e.g. iPhone, Bali trip, gym subscription"
          type="text"
          value={purchase.itemName}
        />
      </label>

      <div className="form-grid two-col">
        <NumberField
          label={
            purchase.purchaseType === 'Subscription'
              ? 'Monthly cost'
              : 'Total cost'
          }
          onChange={(value) =>
            setPurchase((current) => ({ ...current, cost: value }))
          }
          value={purchase.cost}
        />
        <NumberField
          label={
            purchase.purchaseType === 'Experience'
              ? 'Memory value months'
              : 'Expected lifespan months'
          }
          onChange={(value) =>
            setPurchase((current) => ({
              ...current,
              expectedLifespan: value,
            }))
          }
          suffix="months"
          value={purchase.expectedLifespan}
        />
      </div>

      <ChoiceGroup
        label="Type of purchase"
        onChange={(value) =>
          setPurchase((current) => ({ ...current, purchaseType: value }))
        }
        options={purchaseTypes}
        value={purchase.purchaseType}
      />

      <RatingGroup
        captions={[
          'Do not need',
          'Nice to have',
          'Useful',
          'Important',
          'Essential',
        ]}
        label="How much do you need it?"
        onChange={(value) =>
          setPurchase((current) => ({ ...current, needScore: value }))
        }
        value={purchase.needScore}
      />

      <RatingGroup
        captions={[
          'Barely',
          'Curious',
          'Want it',
          'Excited',
          'Love it',
        ]}
        label="How much do you want it?"
        onChange={(value) =>
          setPurchase((current) => ({ ...current, wantScore: value }))
        }
        value={purchase.wantScore}
      />

      <ChoiceGroup
        label={
          purchase.purchaseType === 'Experience'
            ? 'Emotional value'
            : 'Usage frequency'
        }
        onChange={(value) =>
          setPurchase((current) => ({ ...current, usageFrequency: value }))
        }
        options={
          purchase.purchaseType === 'Experience'
            ? [
                { value: 'daily', label: 'Life-changing' },
                { value: 'weekly', label: 'Memorable' },
                { value: 'monthly', label: 'Nice' },
                { value: 'rarely', label: 'Forgettable' },
              ]
            : usageOptions
        }
        value={purchase.usageFrequency}
      />

      <div className="form-grid three-col">
        <ChoiceGroup
          label="Urgency"
          onChange={(value) =>
            setPurchase((current) => ({ ...current, urgency: value }))
          }
          options={['Need now', 'Soon', 'Later']}
          value={purchase.urgency}
        />
        <ChoiceGroup
          label="Alternatives checked?"
          onChange={(value) =>
            setPurchase((current) => ({
              ...current,
              alternativeChecked: value,
            }))
          }
          options={['Yes', 'No']}
          value={purchase.alternativeChecked}
        />
        <ChoiceGroup
          label="Regret risk"
          onChange={(value) =>
            setPurchase((current) => ({ ...current, regretRisk: value }))
          }
          options={['Low', 'Medium', 'High']}
          value={purchase.regretRisk}
        />
      </div>

      <div className="actions split">
        <button className="secondary" onClick={onBack} type="button">
          Back
        </button>
        <button className="primary" onClick={onCalculate} type="button">
          Show me the verdict
        </button>
      </div>
    </section>
  )
}
