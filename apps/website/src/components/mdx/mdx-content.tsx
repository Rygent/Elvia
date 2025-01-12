import * as React from 'react';
import { components } from '@/components/mdx/mdx-components';
import { useMDXComponent } from 'next-contentlayer2/hooks';

interface MDXContentProps {
	code: string;
}

export function MDXContent({ code }: MDXContentProps) {
	const Component = useMDXComponent(code);

	return (
		<div className="mdx">
			<Component components={components} />
		</div>
	);
}
