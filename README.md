# Buy It or Not?

A frontend-only purchase decision helper built with React and Vite. It turns a purchase price into work time, savings delay, cost per use, and regret risk, then gives a transparent score out of 100.

## Features

- Two-step calculator for income and purchase details
- Transparent score breakdown across affordability, time, need, want, value, and regret risk
- Verdict bands: Buy it, Worth it but check timing, Wait, Think harder, Skip it
- Cost per use, work-hours cost, and savings-time calculations
- Local decision history with edit, delete, and clear actions
- No backend, database, or authentication

## Data Stored

The app stores completed decisions in `localStorage` on the user's device only. No data is sent to a server.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```
