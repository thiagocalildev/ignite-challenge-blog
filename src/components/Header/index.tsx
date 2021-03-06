import Link from 'next/link';
import Image from 'next/image';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <a>
            <Image
              src="/images/logo.svg"
              alt="logo"
              width={238.62}
              height={25.63}
            />
          </a>
        </Link>
      </div>
    </header>
  );
}
