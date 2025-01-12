'use client';

import * as React from 'react';
import { TOCThumb } from '@/components/toc-thumb';
import { ScrollArea } from '@elvia/ui';
import { cn } from '@elvia/utils';
import type { TOCItemType } from 'fumadocs-core/server';
import * as Primitive from 'fumadocs-core/toc';

const TOCAnchorProvider = Primitive.AnchorProvider;

const TOCItemsEmpty = () => {
	return <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">No Headings</div>;
};

const TableOfContents = ({ toc }: { toc: TOCItemType[] }) => {
	return <TOCItems toc={toc} />;
};

const TOCItems = ({ toc, isMenu = false }: { toc: TOCItemType[]; isMenu?: boolean }) => {
	const viewportRef = React.useRef<HTMLDivElement>(null);
	const containerRef = React.useRef<HTMLDivElement>(null);

	const [svg, setSvg] = React.useState<{
		path: string;
		width: number;
		height: number;
	}>();

	React.useEffect(() => {
		if (!containerRef.current) return;
		const container = containerRef.current;

		function onResize(): void {
			if (container.clientHeight === 0) return;
			let w = 0;
			let h = 0;
			const d: string[] = [];
			for (let i = 0; i < toc.length; i++) {
				const element: HTMLElement | null = container.querySelector(`a[href="#${toc[i]!.url.slice(1)}"]`);
				if (!element) continue;

				const styles = getComputedStyle(element);
				const offset = getLineOffset(toc[i]!.depth) + 1;
				const top = element.offsetTop + parseFloat(styles.paddingTop);
				const bottom = element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom);

				w = Math.max(offset, w);
				h = Math.max(h, bottom);

				d.push(`${i === 0 ? 'M' : 'L'}${offset} ${top}`);
				d.push(`L${offset} ${bottom}`);
			}

			setSvg({
				path: d.join(' '),
				width: w + 1,
				height: h
			});
		}

		const observer = new ResizeObserver(onResize);
		onResize();

		observer.observe(container);
		return () => {
			observer.disconnect();
		};
	}, [toc]);

	if (toc.length === 0) return <TOCItemsEmpty />;

	return (
		<ScrollArea className={cn('relative flex min-h-0 flex-col text-sm', { '-ms-3': isMenu })} ref={viewportRef}>
			{svg && (
				<div
					className="absolute start-0 top-0 rtl:-scale-x-100"
					style={{
						width: svg.width,
						height: svg.height,
						maskImage: `url("data:image/svg+xml,${
							// Inline SVG
							encodeURIComponent(
								`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="1" fill="none" /></svg>`
							)
						}")`
					}}
				>
					<TOCThumb
						containerRef={containerRef}
						className="mt-[var(--thumb-top)] h-[var(--thumb-height)] bg-foreground transition-all"
					/>
				</div>
			)}
			<Primitive.ScrollProvider containerRef={viewportRef}>
				<div className="flex flex-col" ref={containerRef}>
					{toc.map((item, i) => (
						<TOCItem key={item.url} item={item} upper={toc[i - 1]?.depth} lower={toc[i + 1]?.depth} />
					))}
				</div>
			</Primitive.ScrollProvider>
		</ScrollArea>
	);
};

function getItemOffset(depth: number): number {
	if (depth <= 2) return 14;
	if (depth === 3) return 26;
	return 36;
}

function getLineOffset(depth: number): number {
	return depth >= 3 ? 10 : 0;
}

function TOCItem({
	item,
	upper = item.depth,
	lower = item.depth
}: {
	item: TOCItemType;
	upper?: number;
	lower?: number;
}): React.ReactElement {
	const offset = getLineOffset(item.depth);
	const upperOffset = getLineOffset(upper);
	const lowerOffset = getLineOffset(lower);

	return (
		<Primitive.TOCItem
			href={item.url}
			style={{
				paddingInlineStart: getItemOffset(item.depth)
			}}
			className={cn(
				'relative py-1.5 text-sm text-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-foreground'
			)}
		>
			{offset !== upperOffset && (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					className="absolute -top-1.5 start-0 size-4 rtl:-scale-x-100"
				>
					<line x1={upperOffset} y1="0" x2={offset} y2="12" className="stroke-foreground/10" strokeWidth="1" />
				</svg>
			)}
			<div
				className={cn(
					'absolute inset-y-0 w-px bg-foreground/10',
					offset !== upperOffset && 'top-1.5',
					offset !== lowerOffset && 'bottom-1.5'
				)}
				style={{
					insetInlineStart: offset
				}}
			/>
			{item.title}
		</Primitive.TOCItem>
	);
}

export { TOCAnchorProvider, TableOfContents };
