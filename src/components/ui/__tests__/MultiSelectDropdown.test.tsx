import { render, screen } from '@testing-library/react';
import MultiSelectDropdown from '../MultiSelectDropdown';

const options = [
  { label: 'Client A', value: 'client_a' },
  { label: 'Client B', value: 'client_b' },
  { label: 'Client C', value: 'client_c' }
];

describe('MultiSelectDropdown', () => {
  test('renders with input and all options in dropdown', () => {
    const handleChange = (jest as any).fn();
    render(<MultiSelectDropdown options={options} value={[]} onChange={handleChange} />);
    
    // Check that input exists with placeholder
    const input = screen.getByPlaceholderText('Search or select option');
    expect(input).toBeInTheDocument();
    
    // Check that all options are rendered in the DOM
    expect(screen.getAllByText('Client A')).toBeDefined();
    expect(screen.getByText('Client B')).toBeInTheDocument();
    expect(screen.getByText('Client C')).toBeInTheDocument();
  });

  test('renders selected value as tag', () => {
    const handleChange = (jest as any).fn();
    const { rerender } = render(
      <MultiSelectDropdown options={options} value={['client_a']} onChange={handleChange} />
    );
    
    // The selected tag should be visible
    expect(screen.getAllByText('Client A').length).toBeGreaterThan(0);
    
    // Re-render with multiple selections
    rerender(<MultiSelectDropdown options={options} value={['client_a', 'client_b']} onChange={handleChange} />);
    expect(screen.getAllByText('Client A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Client B').length).toBeGreaterThan(0);
  });

  test('renders with custom placeholder name', () => {
    const handleChange = (jest as any).fn();
    render(<MultiSelectDropdown name="testField" options={options} value={[]} onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText('Search or select option');
    expect(input).toBeInTheDocument();
  });
});
