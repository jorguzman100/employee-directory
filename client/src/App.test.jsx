import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

vi.mock('./components/Main', () => ({
  default: () => null,
}));

test('renders the app header and theme toggle', () => {
  render(<App />);

  expect(screen.getByText(/employee atlas/i)).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /switch to dark mode/i })
  ).toBeInTheDocument();
});
