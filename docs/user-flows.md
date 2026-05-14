# User Flows

## 1. Create a Job

1. Client connects a wallet.
2. Client fills title, description, amount, and deadline.
3. The app uploads job metadata to IPFS.
4. The client approves USDC spending.
5. The contract creates the escrowed job.
6. Supabase stores the indexed job record.

## 2. Accept a Job

1. Freelancer browses open jobs.
2. Freelancer accepts the job on-chain.
3. Supabase records an app-level pending acceptance state.
4. Client approves the freelancer acceptance in the UI.
5. Chat and active collaboration unlock after approval.

## 3. Submit Work

1. Freelancer uploads the primary deliverable and any supporting files.
2. Submission metadata is stored in Supabase.
3. Deliverable hash is sent to the contract.
4. The job moves into review.

## 4. Approve Work

1. Client reviews the deliverable.
2. Client approves on-chain.
3. Escrow funds are released.
4. The job is marked completed in the product layer.

## 5. Raise a Dispute

1. Client or freelancer opens the dispute form on the job page.
2. Evidence can be uploaded to IPFS.
3. The app creates a dispute record in Supabase.
4. AI analysis is triggered asynchronously.

## 6. Analyze and Review a Dispute

1. The dispute details page loads job, dispute, analysis, report, and vote data.
2. AI analysis can be generated from job and submission data.
3. A legal report can be generated from transcripts, meeting evidence, and IPFS evidence.
4. Parties can respond to the dispute report.

## 7. Vote and Resolve

1. Jurors review the dispute package.
2. Juror votes are recorded.
3. Resolution status and outcome are displayed in the dispute UI.

## Practical Note

The current MVP mixes contract-backed state and product-layer state. Any new feature work in these flows should explicitly declare whether the contract or Supabase owns the state transition.
