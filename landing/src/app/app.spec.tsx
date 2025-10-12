import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should render restaurant header', () => {
    const { getAllByText } = render(<App />);
    const elements = getAllByText(/Restaurant/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});
