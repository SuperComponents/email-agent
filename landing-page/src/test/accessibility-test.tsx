import React from 'react';
import {
  ScrollAnimation,
  TextReveal,
  CountUp,
  Parallax,
} from '../components/ScrollAnimations';

// Simple test component to verify accessibility features
export function AccessibilityTest() {
  return (
    <div className="min-h-screen p-8 space-y-16">
      <h1 className="text-3xl font-bold">Accessibility Test Page</h1>

      <div className="bg-blue-100 p-4 rounded">
        <p className="mb-4">
          <strong>Instructions:</strong> To test reduced motion preferences:
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Open browser DevTools (F12)</li>
          <li>Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)</li>
          <li>Type "Emulate CSS prefers-reduced-motion"</li>
          <li>Select "reduce" from the dropdown</li>
          <li>Refresh the page and observe that animations are disabled</li>
        </ol>
      </div>

      <section>
        <h2 className="text-2xl mb-4">ScrollAnimation Component Test</h2>
        <ScrollAnimation animation="fadeUp">
          <div className="bg-green-200 p-4 rounded">
            This should fade up when scrolled into view (or appear immediately
            with reduced motion)
          </div>
        </ScrollAnimation>
      </section>

      <section>
        <h2 className="text-2xl mb-4">TextReveal Component Test</h2>
        <TextReveal
          text="This text should reveal word by word"
          className="text-xl font-semibold"
        />
      </section>

      <section>
        <h2 className="text-2xl mb-4">CountUp Component Test</h2>
        <div className="text-4xl font-bold">
          <CountUp end={42} duration={2} prefix="$" suffix="K" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl mb-4">Parallax Component Test</h2>
        <div className="h-96 bg-gradient-to-b from-purple-400 to-pink-400 flex items-center justify-center">
          <Parallax speed={0.5}>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              This element should move with parallax effect (or stay static with
              reduced motion)
            </div>
          </Parallax>
        </div>
      </section>

      <div className="h-96 bg-gray-100 flex items-center justify-center">
        <p>Scroll spacer to test animations</p>
      </div>
    </div>
  );
}
