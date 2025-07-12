import { useCallback, useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

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
    target: 'aside', // Thread list sidebar (first <aside> rendered by AppLayout)
    title: 'Conversation list',
    content:
      'All customer conversations live here. Filter, search, or click a thread to open it.',
  },
  {
    target: 'main', // Main area where thread details are rendered
    title: 'Message thread',
    content: 'This area shows the full conversation with the customer.',
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