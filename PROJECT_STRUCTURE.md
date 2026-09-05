# PATTERN / Improve-your-game

## Project Overview

`Improve-your-game` is the PATTERN relationship-story and pattern-analysis prototype. It gives a user a private, emotionally styled space to describe an interpersonal situation, organize observable events, compare the situation with historical examples, and think through possible next steps.

The product is intentionally presented as an interactive story experience rather than a traditional questionnaire or prediction dashboard. The frontend provides:

- A cinematic heart-themed introduction.
- Mock authentication and demo entry flows.
- New-user onboarding and returning-user profile handling.
- A persistent profile stored in browser `localStorage`.
- Conversational story collection with quick replies and optional free text.
- Evidence, timeline, reality-check, overthinking, Bro Mode, and decision-simulation views.
- React Router navigation for home, profile, stories, analysis, result, evidence, and informational pages.
- Local fallback analysis when the deployed API is unavailable.

The backend provides a Vercel-compatible Python HTTP handler at `POST /api/analyze`. That handler loads the historical CSV dataset and delegates similarity analysis to `RejectionPatternAnalyzer`.

The ML component is a K-nearest-neighbors similarity analyzer. It does not train a predictive classifier or infer another person's private thoughts. It finds five historically similar rows, calculates a negative-outcome ratio, assigns a `HIGH`, `MEDIUM`, or `LOW` warning, and returns the most common pattern among those similar rows.

### Actual communication architecture

```text
User interaction
      |
      v
React/Vite frontend
      |
      | POST /api/analyze
      v
Vercel Python function: api/index.py
      |
      v
backend/analyzer.py
      |
      v
rejection_pattern_demo_dataset.csv
      |
      v
Similarity result JSON
      |
      v
Frontend result/evidence/Bro Mode views
```

For local development or API failure, `frontend/src/services/api.js` falls back to a deterministic local analysis function so the UI remains usable.

## Complete Folder Tree

The tree below lists the meaningful source, configuration, and data files currently in the repository. Generated or environment-specific directories are listed separately afterward because they are ignored by Git and should not be treated as application source.

```text
Improve-your-game/
├── .gitignore
├── PROJECT_STRUCTURE.md
├── README.md
├── requirements.txt
├── vercel.json
├── api/
│   └── index.py
├── backend/
│   ├── analyzer.py
│   ├── requirements.txt
│   ├── train.py
│   └── data/
│       └── rejection_pattern_demo_dataset.csv
└── frontend/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── App.jsx
        ├── broMode.css
        ├── index.css
        ├── intro.css
        ├── main.jsx
        ├── profile.css
        ├── routing.css
        ├── components/
        │   ├── IntroFlow.jsx
        │   └── PixelDecor.jsx
        ├── engine/
        │   ├── broModeEngine.js
        │   └── conversationEngine.js
        └── services/
            └── api.js
```

### Generated or environment-specific directories

These directories exist or may exist locally, but are excluded from the documented application tree because they are generated, machine-specific, or dependency-heavy:

- `frontend/node_modules/`: npm-installed frontend dependencies.
- `frontend/dist/`: Vite production build output.
- `backend/venv/`: local Python virtual environment.
- `backend/__pycache__/`: Python bytecode cache.
- `*.pyc`: compiled Python files.

The repository `.gitignore` excludes all of the above categories.

### Empty directories

The following source directories currently exist but contain no files:

- `frontend/src/data/`
- `frontend/src/utils/`

There are no separate `pages/`, `hooks/`, `context/`, or `auth/` directories at present. Their behavior is currently implemented inside `App.jsx`, `IntroFlow.jsx`, and the engine modules.

## Root Files

### `.gitignore`

Ignores local Python environments, Python caches, npm dependencies, Vite output, and `.env` files:

- `venv/`
- `backend/venv/`
- `__pycache__/`
- `*.pyc`
- `node_modules/`
- `frontend/node_modules/`
- `frontend/dist/`
- `.env`

### `README.md`

Currently contains only the project heading `Improve-your-game`. It does not yet provide setup, API, ML, or deployment instructions; this document supplies that missing project reference.

### `requirements.txt`

The root Python dependency file used by the Vercel deployment. It currently pins:

```text
pandas==2.2.3
scikit-learn==1.6.1
```

### `vercel.json`

The Vercel deployment configuration:

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm install"
}
```

It also configures two rewrite behaviors:

1. `/api/:path*` is sent to `/api/index.py`.
2. All other paths are sent to `/index.html` so React Router can handle client-side routes.

The Python function is configured with a maximum duration of 60 seconds.

## API Layer

### `api/index.py`

This is the deployed Python function entry point. It is not a Flask application; it uses Python's `http.server.BaseHTTPRequestHandler`, which is compatible with the Vercel Python function convention used by this project.

Responsibilities:

1. Resolve the dataset path relative to the repository:

   ```text
   backend/data/rejection_pattern_demo_dataset.csv
   ```

2. Create one module-level `RejectionPatternAnalyzer` instance.
3. Accept `POST /api/analyze`.
4. Parse the JSON request body.
5. Pass the payload to `analyzer.analyze(payload)`.
6. Return the result as JSON.
7. Return `400` for invalid JSON or payload shape errors.
8. Return `500` for unexpected analysis errors.
9. Respond to `OPTIONS` with CORS headers.

Supported HTTP behavior:

- `POST /api/analyze`: performs analysis.
- `OPTIONS /api/analyze`: returns an empty preflight response.
- Other paths: return a JSON `404` response.

The handler adds permissive CORS headers (`Access-Control-Allow-Origin: *`). Since the frontend and API are deployed under the same Vercel project and the frontend uses a relative URL, CORS is normally not required for the primary deployment path.

## Backend and ML

### `backend/analyzer.py`

Defines `RejectionPatternAnalyzer`.

#### Input features

The analyzer expects a dictionary containing these 11 fields:

Categorical features:

- `approach_method`
- `conversation_stage`
- `initial_yes`
- `reply_change`
- `reciprocity`
- `mixed_signals`
- `relationship_status`
- `his_investment`
- `he_increased_pursuit`

Numeric features:

- `days_talking`
- `meetings`

The frontend conversation engine maps natural conversation choices to these technical feature names before analysis.

#### Preprocessing

Historical rows are loaded with pandas. A scikit-learn `ColumnTransformer` applies:

- `OneHotEncoder(handle_unknown="ignore")` to categorical columns.
- `StandardScaler()` to `days_talking` and `meetings`.

The preprocessor is fitted once during analyzer initialization. New cases are transformed with that same fitted preprocessor.

#### Similarity algorithm

The analyzer uses:

```python
NearestNeighbors(
    n_neighbors=5,
    metric="cosine"
)
```

The five nearest historical rows are selected. For each row:

```text
similarity = (1 - cosine_distance) * 100
```

The response includes each case ID, similarity percentage, pattern tag, and outcome.

#### Warning calculation

Negative outcomes are:

- `rejected`
- `ghosted`
- `not_available`

The negative ratio is calculated across the five nearest cases:

- `HIGH` when ratio is at least `0.70`.
- `MEDIUM` when ratio is at least `0.40` but below `0.70`.
- `LOW` when ratio is below `0.40`.

The most frequent `pattern_tag` among the nearest cases becomes `common_pattern`.

#### Analyzer response shape

```json
{
  "warning": "HIGH",
  "negative_cases": 4,
  "total_similar_cases": 5,
  "negative_ratio": 0.8,
  "common_pattern": "ghosting_after_yes",
  "pattern_frequency": 3,
  "similar_cases": [
    {
      "case_id": "G034",
      "similarity": 91.2,
      "pattern": "ghosting_after_yes",
      "outcome": "ghosted"
    }
  ]
}
```

The analyzer reports similarity to historical cases. It does not establish causation, destiny, or a person's hidden intentions.

### `backend/train.py`

A standalone exploratory/training script. It duplicates the analyzer's preprocessing and KNN setup, prints dataset information, transforms a hard-coded example case, prints nearest cases, and calculates the same negative-outcome summary.

It is not imported by the Vercel API and is not required for the frontend build or deployed request path.

### `backend/requirements.txt`

This file is currently empty. The dependencies required by the deployed Python handler are declared in the root `requirements.txt`. For local backend work, install from the root file unless the dependency strategy is intentionally reorganized later.

### `backend/data/rejection_pattern_demo_dataset.csv`

The historical demo dataset used by `RejectionPatternAnalyzer`.

Verified dataset facts:

- 100 data rows.
- 14 columns.
- 11 model input columns.
- 2 output/label columns: `pattern_tag` and `outcome`, in addition to `case_id`.

Columns:

```text
case_id
approach_method
conversation_stage
initial_yes
reply_change
reciprocity
mixed_signals
relationship_status
his_investment
days_talking
meetings
he_increased_pursuit
pattern_tag
outcome
```

Pattern counts in the current dataset:

- `already_has_boyfriend`: 20
- `ghosting_after_yes`: 16
- `healthy_reciprocity`: 16
- `one_sided_effort`: 11
- `overinvesting`: 10
- `moved_on_quickly`: 10
- `mixed_signals`: 9
- `slow_replies`: 8

Outcome counts:

- `rejected`: 38
- `ghosted`: 16
- `positive`: 16
- `not_available`: 20
- `moved_on`: 10

## Frontend

### `frontend/index.html`

Vite's HTML entry document. It defines the viewport, theme color, page title, root DOM element, and module entry point `/src/main.jsx`.

### `frontend/package.json`

Defines the frontend npm package and scripts:

```text
npm run dev       Start Vite development server
npm run build     Create a production build in frontend/dist
npm run preview   Preview the production build locally
```

Important dependencies:

- React and React DOM.
- Vite and the React Vite plugin.
- `framer-motion` for transitions and animated story states.
- `lucide-react` for interface icons.
- `react-router-dom` for SPA routing.

The package also contains Three.js-related dependencies (`three`, `@react-three/fiber`, and `@react-three/drei`), but the current PATTERN UI does not use Three.js for its main experience.

### `frontend/package-lock.json`

Locks the resolved npm dependency versions for reproducible installs.

### `frontend/src/main.jsx`

Bootstraps the React application with `React.StrictMode`, renders `App`, and imports all global stylesheets:

- `index.css`
- `broMode.css`
- `intro.css`
- `routing.css`
- `profile.css`

### `frontend/src/App.jsx`

The main application composition file. It currently contains the major screen components and the router shell.

Responsibilities include:

- Rendering the authenticated navigation bar.
- Defining React Router routes.
- Restoring profile, current features, current result, and saved stories from `localStorage`.
- Starting demo mode.
- Starting and finishing a conversational story.
- Launching analysis.
- Saving stories.
- Rendering home, profile, story, analysis, result, evidence, decision, reality-check, settings, and informational screens.

Important routes currently represented:

```text
/
/auth
/home
/profile
/stories
/stories/:id
/stories/:id/analyze
/stories/:id/result
/stories/:id/evidence
/stories/:id/reality
/stories/:id/overthink
/stories/:id/decision
/how-it-works
/insights
/settings
```

The application is currently a single large JSX module rather than a page/component directory architecture.

### `frontend/src/components/IntroFlow.jsx`

Contains the pre-application experience:

- Cinematic intro text and heart transitions.
- Mock authentication/entry screen.
- Email-style demo account creation.
- Mock Google connection state.
- Demo bypass.
- New-user onboarding.
- Returning-user welcome flow.
- Profile reveal and story-style summary.

The component does not connect to Firebase or another real authentication provider. It creates and restores prototype profile data through the parent application and browser storage.

### `frontend/src/components/PixelDecor.jsx`

Renders small floating heart, sparkle, and pixel-style background particles using Framer Motion. The component is decorative and marked `aria-hidden`.

### `frontend/src/engine/conversationEngine.js`

The deterministic conversational question engine.

It contains:

- `emptyFeatures`, the ML feature object shape.
- Natural-language questions for each feature.
- Quick-reply options and their technical values.
- Lightweight keyword extraction from free text.
- Opening-choice inference.
- Adaptive question ordering.
- Reaction templates.
- Context notes based on observed feature combinations.

This file is not an LLM integration. Questions and inferences are deterministic and explainable.

### `frontend/src/engine/broModeEngine.js`

Contains the higher-level story and decision layer:

- Default profile shape.
- Fictional demo story.
- Home mode choices.
- Personalized greeting generation.
- Timeline generation.
- Fact/pattern/interpretation/unknown analysis.
- Scorecard values.
- Decision options.
- Hypothetical decision paths.
- Reality-check and overthinking summaries.
- Local story persistence helper.

The outputs are rule-based and should be treated as contextual guidance, not psychological diagnosis or future prediction.

### `frontend/src/services/api.js`

Frontend API service.

`analyzeSituation(payload)`:

1. Sends `POST /api/analyze` when demo mode is disabled.
2. Serializes the ML feature payload as JSON.
3. Returns the API response.
4. Falls back to `localAnalysis(payload)` if the request fails.

The fallback computes a simple concern count from reply changes, reciprocity, mixed signals, pursuit, and availability, then returns a result shaped like the backend response.

### CSS files

#### `frontend/src/index.css`

Base application styles and the original dark emotional visual system: typography, colors, chat surfaces, results, particles, cards, and responsive rules.

#### `frontend/src/intro.css`

Cinematic intro, authentication, onboarding, and profile-reveal styling. Includes the reduced-motion media query.

#### `frontend/src/broMode.css`

Dashboard, story, evidence, timeline, reality-check, decision-simulator, and Bro Mode styling.

#### `frontend/src/routing.css`

Authenticated navbar, profile dropdown, mobile navigation drawer, stories page, informational page, and error-state styling.

#### `frontend/src/profile.css`

Profile priority multi-select styling.

## Frontend-to-Backend Contract

The conversational UI ultimately produces the following object shape:

```json
{
  "approach_method": "Instagram",
  "conversation_stage": "Talking",
  "initial_yes": "Yes",
  "reply_change": "reduced",
  "reciprocity": "low",
  "mixed_signals": "Yes",
  "relationship_status": "single/unknown",
  "his_investment": "high",
  "days_talking": 15,
  "meetings": 0,
  "he_increased_pursuit": "Yes"
}
```

The exact categorical vocabulary should remain aligned with the dataset. Unknown categorical values are technically accepted by the scikit-learn encoder because `handle_unknown="ignore"` is enabled, but they may reduce similarity quality.

Request:

```http
POST /api/analyze
Content-Type: application/json
```

Response:

```json
{
  "warning": "HIGH | MEDIUM | LOW",
  "negative_cases": 0,
  "total_similar_cases": 5,
  "negative_ratio": 0.0,
  "common_pattern": "pattern_tag",
  "pattern_frequency": 0,
  "similar_cases": []
}
```

## State and Persistence

The prototype uses browser `localStorage`, not a database or server-side user account system.

Known storage keys include:

- `pattern-profile`: current profile/onboarding information.
- `pattern-current-features`: current story's ML feature object.
- `pattern-current-result`: current analysis result.
- `pattern-stories`: saved story summaries.
- `pattern-private-note`: private notes from the evidence workspace.

This persistence is device/browser-specific. Clearing site data removes the prototype session and saved stories. It is not suitable for sensitive production data without encryption, authentication, access controls, and a backend storage layer.

## Local Development

### Frontend

From the repository root:

```powershell
cd frontend
npm install
npm run dev
```

The Vite development server normally runs at:

```text
http://localhost:5173
```

Build and preview:

```powershell
cd frontend
npm run build
npm run preview
```

### Python analyzer smoke test

The analyzer has a standalone example block:

```powershell
python backend/analyzer.py
```

Because the Python environment is local and ignored, install the root dependencies first if needed:

```powershell
python -m pip install -r requirements.txt
```

The Vercel handler can also be import-checked from the repository root:

```powershell
python -c "from api.index import analyzer; print(analyzer.df.shape)"
```

Expected current dataset shape:

```text
(100, 14)
```

## Deployment on Vercel

Deploy the repository root as the Vercel project root. Do not set `frontend` as the Vercel root directory, because the root `vercel.json`, `api/`, `backend/`, and dataset are needed for the combined deployment.

`vercel.json` performs the following:

1. Runs `cd frontend && npm run build`.
2. Publishes `frontend/dist` as the static output.
3. Installs frontend dependencies with `cd frontend && npm install`.
4. Routes `/api/*` to the Python function at `api/index.py`.
5. Routes all non-API paths to `frontend/index.html` for React Router fallback.
6. Allows the Python function up to 60 seconds.

Expected deployed URLs:

```text
https://your-project.vercel.app/
https://your-project.vercel.app/home
https://your-project.vercel.app/api/analyze
```

The frontend calls `/api/analyze` using a relative URL, so the API and frontend can share the same Vercel domain.

## Known Limitations and Follow-up Work

- Authentication is mock/local only; Google and email flows do not create real accounts.
- User profiles and stories are stored only in browser `localStorage`.
- The backend has no database and no server-side story persistence.
- `backend/requirements.txt` is empty; deployment dependencies are currently declared in the root `requirements.txt`.
- `train.py` is a standalone exploratory script rather than a reusable training pipeline.
- The ML analyzer is a nearest-neighbor similarity tool, not a calibrated probability model.
- The current dataset is a demo dataset with 100 rows and should not be treated as validated clinical, behavioral, or predictive data.
- The API loads and fits the analyzer at module import time, which may affect cold-start latency in serverless deployment.
- The API handler returns broad CORS headers; production deployments may want a restricted origin policy.
- There are no automated frontend or backend test suites in the repository.
- There is no explicit Vercel build configuration for Python dependency caching beyond the root requirements file.
- The frontend package includes Three.js dependencies, but the current interface does not use Three.js.

## Responsible Use

PATTERN should be described as a tool for organizing a user's account of observable events and comparing them with historical examples. Its output is not proof of another person's intentions, a diagnosis, or a guarantee about a future outcome.

The most important distinction in the current design is:

```text
Facts        = what the user directly reports
Patterns     = repeated observable behavior
Interpretation = a possible explanation
Advice       = a reasonable option, not an absolute command
```
