import type Input from '../components/Input/Input';

export default function getInputValue(input?: Input): string {
  const elementValue = input?.element?.querySelector('input')?.value;

  if (typeof elementValue === 'string') {
    return elementValue;
  }

  return typeof input?.props.value === 'string' ? input.props.value : '';
}
