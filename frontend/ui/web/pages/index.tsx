import { Link } from '@dex/router/client'

export const metadata = { title: 'Emperor Data Analytics' }

export default function Page() {
	return (
		<main className="max-w-2xl mx-auto px-6 py-16 space-y-6">
			<h1 className="text-3xl font-semibold">Dex Starter</h1>
			<p className="text-[var(--text-muted)]">
				This is a minimal Dex template app.
			</p>
			
			<div className="flex flex-col gap-4">
				<Link 
					to="/analysis"
					className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-center transition-colors shadow-lg shadow-blue-900/20"
				>
					🚀 Launch Analysis Studio
				</Link>
				
				<div className="flex gap-4 text-sm text-[var(--text-muted)] justify-center">
					<Link className="underline hover:text-white" to="/about">
						About
					</Link>
					<span>•</span>
					<Link className="underline hover:text-white" to="/test">
						Test Page
					</Link>
				</div>
			</div>
		</main>
	)
}
