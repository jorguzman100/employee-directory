import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/Main', () => () => null);

test('renders the app header and theme toggle', () => {
  render(<App />);

  expect(screen.getByText(/employee atlas/i)).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /switch to dark mode/i })
  ).toBeInTheDocument();
});
