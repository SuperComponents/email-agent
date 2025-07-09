import { DefaultContextGenerator, DefaultContextGeneratorV2 } from "./context/context";

import runEvals, { type EvalScenario } from "./eval_framework/runner";
import loginIssuePolicyEvalTests from "./evals/01_login_issue_v2_policy.eval";
import positiveFeedbackPolicyEvalTests from "./evals/04_positive_feedback_v2_policy.eval";
import { LLMClient } from "./llm";

const scenarios: EvalScenario[] = [
  {
    model: new LLMClient("gpt-4o-mini"),
    contextGenerator: DefaultContextGenerator,
  },
  {
    model: new LLMClient("gpt-4o-mini"),
    contextGenerator: DefaultContextGeneratorV2,
  },
  
  

];


// Test policy-aligned evaluations for DefaultContextGeneratorV2
runEvals(scenarios, [
  ...loginIssuePolicyEvalTests,
  ...positiveFeedbackPolicyEvalTests
]);
