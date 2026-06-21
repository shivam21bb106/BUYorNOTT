import { useMemo, useState } from 'react'
import './App.css'
import {
  HISTORY_KEY,
  initialIncome,
  initialPurchase,
} from './constants/appData'
import { HistoryTable } from './components/history/HistoryTable'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/layout/Hero'
import { TopNav } from './components/layout/TopNav'
import { ResultCard } from './components/results/ResultCard'
import { IncomeStep } from './components/steps/IncomeStep'
import { PurchaseStep } from './components/steps/PurchaseStep'
import { StepIndicator } from './components/StepIndicator'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { numberValue } from './utils/numberFormat'
import { calculateResult } from './utils/scoring'

function App() {
  const [activeStep, setActiveStep] = useState(1)
  const [income, setIncome] = useState(initialIncome)
  const [purchase, setPurchase] = useState(initialPurchase)
  const [history, setHistory] = useLocalStorageState(HISTORY_KEY, [])
  const [currentResult, setCurrentResult] = useState(null)
  const [shareStatus, setShareStatus] = useState('')
  const [editingId, setEditingId] = useState(null)

  const canCalculate = useMemo(
    () =>
      numberValue(income.monthlyIncome) >= 0 &&
      numberValue(purchase.cost) >= 0 &&
      numberValue(income.workHoursPerDay) > 0 &&
      numberValue(income.workDaysPerWeek) > 0,
    [income, purchase.cost],
  )

  function handleCalculate() {
    if (!canCalculate) {
      return
    }

    const result = calculateResult(income, purchase)
    setCurrentResult(result)
    setHistory((current) => [
      result,
      ...current.filter((item) => item.id !== editingId),
    ])
    setActiveStep(3)
    setShareStatus('')
    setEditingId(null)
  }

  function handleReset() {
    setPurchase(initialPurchase)
    setCurrentResult(null)
    setActiveStep(2)
    setShareStatus('')
    setEditingId(null)
  }

  function handleEdit(item = currentResult) {
    if (!item) {
      return
    }

    setIncome(item.income)
    setPurchase(item.purchase)
    setCurrentResult(null)
    setActiveStep(2)
    setShareStatus('')
    setEditingId(item.id)
  }

  async function handleShare() {
    if (!currentResult) {
      return
    }

    const text = `WorthCheck: ${currentResult.purchase.itemName || 'Purchase'} scored ${currentResult.score}/100: ${currentResult.verdict.label}. ${currentResult.recommendation}`

    try {
      await navigator.clipboard.writeText(text)
      setShareStatus('Share text copied.')
    } catch {
      setShareStatus('Copy failed. The browser said no.')
    }
  }

  return (
    <main className="app-shell" id="top">
      <TopNav />
      <Hero />
      <StepIndicator activeStep={activeStep} />

      <div className="workspace" id="calculator">
        {activeStep === 1 ? (
          <IncomeStep
            income={income}
            onNext={() => setActiveStep(2)}
            setIncome={setIncome}
          />
        ) : null}

        {activeStep === 2 ? (
          <PurchaseStep
            onBack={() => setActiveStep(1)}
            onCalculate={handleCalculate}
            purchase={purchase}
            setPurchase={setPurchase}
          />
        ) : null}

        {activeStep === 3 && currentResult ? (
          <ResultCard
            onEdit={() => handleEdit()}
            onReset={handleReset}
            onShare={handleShare}
            result={currentResult}
          />
        ) : null}

        {shareStatus ? <p className="toast">{shareStatus}</p> : null}
      </div>

      <HistoryTable
        history={history}
        onClear={() => setHistory([])}
        onDelete={(id) =>
          setHistory((current) => current.filter((item) => item.id !== id))
        }
        onEdit={handleEdit}
      />

      <Footer />
    </main>
  )
}

export default App
