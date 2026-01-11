# PR_NAMING.md

## PR naming and issue tracking policy

### 1. Requirements

- Every PR must be linked to exactly one GitHub Issue.
- PR title must include the issue number in one of these forms:
  - ... #123
  - ... (#123)
- PR description must include:
  - Closes #123

### 2. Recommended title format

- PH<phase> ST<story> <short title> (#<issue>)

Examples:

- PH3 ST2 Trade events timeline (#42)
- PH4 ST1 Voice note upload and status (#58)
- PH7 ST3 Risk matrix endpoint (#110)

### 3. Branch naming (recommended)

- ph<phase>/st<story>-<slug>-<issue>

Examples:

- ph3/st2-trade-events-42
- ph7/st3-risk-matrix-110

### 4. PR slicing rule

- One PR implements one story only.
- If scope expands, create a new issue and a new PR.
