"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './NavBar.module.css';

export default function NavBar() {
    const pathname = usePathname();

    return (
        <nav className={styles.nav}>
            <div className={styles.logo}>
                <Link href="/">Workbook Marker</Link>
            </div>
            <div className={styles.links}>
                <Link href="/" className={pathname === '/' ? styles.active : ''}>Home</Link>
                <Link href="/progress" className={pathname === '/progress' ? styles.active : ''}>Progress</Link>
            </div>
        </nav>
    );
}
