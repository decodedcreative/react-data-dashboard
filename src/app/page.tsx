import Link from 'next/link';
import { getClassNames } from '@lib/getClassNames';
import classNames from './page.styles';

const HomePage = () => {
  const homePageClassNames = getClassNames(classNames);

  return (
    <main className={homePageClassNames.component}>
      <h1 className={homePageClassNames.title}>React Data Dashboard</h1>
      <p className={homePageClassNames.paragraph}>
        Browse executions, statuses, and related metrics.
      </p>
      <p className={homePageClassNames.paragraph}>
        <Link href="/trades" className={homePageClassNames.link}>
          View trades →
        </Link>
      </p>
    </main>
  );
};

export default HomePage;
