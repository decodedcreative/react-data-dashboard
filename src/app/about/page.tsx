import { Heading } from '@jigsaw-ds/design-system/heading';
import { Link } from '@jigsaw-ds/design-system/link';
import { Text } from '@jigsaw-ds/design-system/text';
import { getClassNames } from '@lib/get-class-names';
import classNames from './page.styles';

const AboutPage = () => {
  const aboutPageClassNames = getClassNames(classNames);

  return (
    <main className={aboutPageClassNames.component}>
      <Heading as="h1">About</Heading>
      <Text as="p">
        Product context and docs can live here. Main data views are under{' '}
        <Link href="/trades">Trades</Link>.
      </Text>
      <Text as="p">
        <Link href="/">← Home</Link>
      </Text>
    </main>
  );
};

export default AboutPage;
