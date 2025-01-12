import * as React from 'react';

type LegalLayoutProps = React.PropsWithChildren;

export default function LegalLayout({ children }: LegalLayoutProps) {
	return (
		<main className="relative mx-auto max-w-[1200px] items-start lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">
			{children}
		</main>
	);
}
