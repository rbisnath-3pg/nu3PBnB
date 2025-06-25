import React from 'react';
import { render, screen } from '@testing-library/react';
import Spinner from '../Spinner';

// Simple test component
const SimpleComponent = () => {
  return <div>Hello World</div>;
};

describe('SimpleComponent', () => {
  it('renders hello world', () => {
    render(<SimpleComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});

describe('Spinner', () => {
  it('renders spinner with default props', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders spinner with custom text', () => {
    render(<Spinner text="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('renders spinner with custom size', () => {
    render(<Spinner size={64} />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('width', '64');
    expect(spinner).toHaveAttribute('height', '64');
  });

  it('renders spinner with custom color', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('text-blue-600');
  });

  it('renders spinner without text when no text is provided', () => {
    render(<Spinner />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Spinner className="custom-class" />);
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('renders with default text when provided', () => {
    render(<Spinner text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with default size when not specified', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('width', '48');
    expect(spinner).toHaveAttribute('height', '48');
  });

  it('renders with default className when not specified', () => {
    render(<Spinner />);
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });

  it('renders with animation classes', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders text with animation when provided', () => {
    render(<Spinner text="Processing..." />);
    const textElement = screen.getByText('Processing...');
    expect(textElement).toHaveClass('animate-pulse');
  });

  it('renders text with correct styling when provided', () => {
    render(<Spinner text="Loading..." />);
    const textElement = screen.getByText('Loading...');
    expect(textElement).toHaveClass('mt-2', 'text-blue-700', 'font-medium', 'text-lg');
  });
}); 