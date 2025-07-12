import { useCallback, useEffect, useState } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { CallBackProps, Step } from 'react-joyride';

// Storage key that marks the tour as completed / skipped
const TOUR_STORAGE_KEY = 'onboardingCompleted';

// Define the tour steps. These selectors target existing elements in the app.
// If a selector is missing at runtime react-joyride will automatically skip that step.
const steps: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Welcome to ProResponse AI',
    content: "Let's take 60 seconds to show you around.",
    disableBeacon: true,
    locale: {
      next: 'Start',
      skip: 'Skip',
    },
  },
  {
    target: '[data-tour="sidebar"]',
    title: 'Conversation list',
    content:
      'All customer conversations live here. Filter, search, or click a thread to open it.',
  },
  {
    target: '[data-tour="thread"]',
    title: 'Message thread',
    content: 'This area shows the full conversation with the customer.',
  },
  {
    target: '[data-tour="use-agent-btn"]',
    title: 'AI assistance',
    content: 'Click "Use Agent" to let the AI draft a reply you can tweak before sending.',
  },
  {
    target: '[data-tour="composer"]',
    title: 'Reply composer',
    content: 'Write or edit your response here. Cmd/Ctrl+Enter sends it.',
  },
  {
    target: '[data-tour="agent-panel"]',
    title: 'Agent activity log',
    content: 'See and chat with the AI as it researches and drafts replies.',
  },
  {
    target: '[data-tour="knowledge-base-link"]',
    title: 'Knowledge base',
    content: 'Add docs & FAQs to keep the AI answers accurate.',
  },
  // Additional steps can be added later when corresponding selectors are present
];

export function OnboardingTour() {
  const [run, setRun] = useState(false);

  // Start the tour if the user hasn't completed it yet
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
    if (!completed) {
      setRun(true);
    }

    const handleStart = () => {
      setRun(true);
    };

    window.addEventListener('startOnboardingTour', handleStart);
    return () => window.removeEventListener('startOnboardingTour', handleStart);
  }, []);

  const handleCallback = useCallback((data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      // Mark tour as completed so it won't show again automatically
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      setRun(false);
    }
  }, []);

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      continuous
      scrollToFirstStep
      showSkipButton
      showProgress
      disableOverlayClose
      callback={handleCallback}
      styles={{
        options: {
          primaryColor: '#6366f1', // Tailwind indigo-500 – matches default primary
          zIndex: 10000,
        },
      }}
    />
  );
}