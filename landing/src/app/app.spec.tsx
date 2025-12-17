import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should render ATH header', () => {
    const { getAllByText } = render(<App />);
    // Check for ATH branding - "Anh Thợ Xây" or similar
    const elements = getAllByText(/Anh Thợ Xây|ATH/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});
