import type Input from '../components/Input/Input';

export default function getInputValue(input?: Input): string {
  return typeof input?.props.value === 'string' ? input.props.value : '';
}
