import Link from 'next/link';
import { getClassNames } from '@lib/get-class-names';
import classNames from './page.styles';

const AboutPage = () => {
  const aboutPageClassNames = getClassNames(classNames);

  return (
    <main className={aboutPageClassNames.component}>
      <h1 className={aboutPageClassNames.title}>About</h1>
      <p className={aboutPageClassNames.paragraph}>
        Product context and docs can live here. Main data views are under{' '}
        <Link href="/trades" className={aboutPageClassNames.link}>
          Trades
        </Link>
        .
      </p>
      <p className={aboutPageClassNames.paragraph}>
        <Link href="/" className={aboutPageClassNames.link}>
          ← Home
        </Link>
      </p>
    </main>
  );
};

export default AboutPage;
