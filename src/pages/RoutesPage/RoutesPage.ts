import routesPageTemplate from './RoutesPage.hbs?raw';
import Block from '../../services/Block';

export default class RoutesPage extends Block {
  constructor(props: object) {
    super(props);
  }

  render() {
    return routesPageTemplate;
  }
}
