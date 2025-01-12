'use client';

import * as React from 'react';
import { TOCThumb } from '@/components/toc-thumb';
import { Popover, PopoverContent, PopoverTrigger, ScrollArea } from '@elvia/ui';
import { ChevronRight, Text } from '@elvia/ui/icons';
import { cn } from '@elvia/utils';
import type { TOCItemType } from 'fumadocs-core/server';
import * as Primitive from 'fumadocs-core/toc';

const InlineTableOfContents = ({ toc }: { toc: TOCItemType[] }) => {
	const active = Primitive.useActiveAnchor();
	const current = React.useMemo(() => {
		return toc.find((item) => active === item.url.slice(1))?.title;
	}, [toc, active]);

	return (
		<Popover>
			<PopoverTrigger className={cn('inline-flex items-center gap-2 text-nowrap px-6 py-2 text-start md:px-8')}>
				<Text className="size-4 shrink-0" />
				On this page
				{current && (
					<>
						<ChevronRight className="-mx-1.5 size-4 shrink-0 text-muted-foreground" />
						<span className="truncate text-muted-foreground">{current}</span>
					</>
				)}
			</PopoverTrigger>
			<PopoverContent
				align="start"
				alignOffset={24}
				hideWhenDetached
				side="bottom"
				className={cn(
					'flex max-h-[var(--radix-popover-content-available-height)] w-[260px] min-w-[220px] max-w-[98vw] flex-col gap-4 rounded-xl p-3'
				)}
			>
				<TOCItems toc={toc} isMenu />
			</PopoverContent>
		</Popover>
	);
};

const TOCItems = ({ toc, isMenu = false }: { toc: TOCItemType[]; isMenu?: boolean }) => {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const viewportRef = React.useRef<HTMLDivElement>(null);

	return (
		<ScrollArea className={cn('relative flex min-h-0 flex-col text-sm', { '-ms-3': isMenu })} ref={viewportRef}>
			<Primitive.ScrollProvider containerRef={viewportRef}>
				<div ref={viewportRef}>
					<TOCThumb
						containerRef={containerRef}
						className="absolute start-0 mt-[var(--thumb-top)] h-[var(--thumb-height)] w-px bg-foreground transition-all"
					/>
					<div ref={containerRef} className={cn('flex flex-col', { 'border-s': !isMenu })}>
						{toc.map((item) => (
							<TOCItem key={item.url} item={item} />
						))}
					</div>
				</div>
			</Primitive.ScrollProvider>
		</ScrollArea>
	);
};

function TOCItem({ item }: { item: TOCItemType }): React.ReactElement {
	return (
		<Primitive.TOCItem
			href={item.url}
			className={cn(
				'py-1.5 text-sm text-muted-foreground transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 data-[active=true]:text-foreground',
				item.depth <= 2 && 'ps-3.5',
				item.depth === 3 && 'ps-6',
				item.depth >= 4 && 'ps-8'
			)}
		>
			{item.title}
		</Primitive.TOCItem>
	);
}

export { InlineTableOfContents };
