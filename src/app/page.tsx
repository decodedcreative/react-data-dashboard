'use client';

import { Heading, LinkButton, Text } from '@jigsaw-ds/design-system';
import { getClassNames } from '@lib/get-class-names';
import classNames from './page.styles';

const HomePage = () => {
  const homePageClassNames = getClassNames(classNames);

  return (
    <main className={homePageClassNames.component}>
      <Heading as="h1">React Data Dashboard</Heading>
      <Text as="p">Browse executions, statuses, and related metrics.</Text>
      <LinkButton href="/trades" variant="primary">
        View trades →
      </LinkButton>
    </main>
  );
};

export default HomePage;
