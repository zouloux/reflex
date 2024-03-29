import { changed, h, mounted, state } from "reflex-dom";
import sdk from '@stackblitz/sdk';
import { VM } from "@stackblitz/sdk/types/vm";
import { limitRange } from "@zouloux/ecma-core";
import S from "./App.module.less"
import { marked } from "marked";


function loadStackFiles () {
	// Load all stack files as raw text
	const __globFiles = import.meta.glob('../stack/**/**.*', { as: 'raw', eager: true });
	// const file = import.meta.glob('../stack/steps/01.props.tsx', { as: 'raw', eager: true });
	// console.log( file );
	// Patch keys
	const stackFiles:Record<string, string> = {}
	Object.keys( __globFiles ).map( fileName => {
		const value = __globFiles[ fileName ]
		fileName = fileName.substring(9, fileName.length)
		stackFiles[ fileName ] = value
	})
	return stackFiles
}

export function App ( props ) {
	let _editor:VM
	let _stepFiles:string[] = []
	let _docsFiles:string[] = []
	let stackFiles = loadStackFiles()
	mounted( async () => {
		const filteredStackFiles = Object.keys( stackFiles ).filter( f => f.startsWith('steps/') );
		_stepFiles = filteredStackFiles.filter( f =>f.endsWith('.tsx') )
		_docsFiles = filteredStackFiles.filter( f =>f.endsWith('.md') )
		_editor = await sdk.embedProject(
			'iframe', {
				title: 'Learn Reflex',
				description: 'Learn Reflex tutorial',
				template: 'node',
				files: {
					...stackFiles,
					'loading' : 'Stackblitz is loading'
				}
			}, {
				clickToLoad: false,
				openFile: 'loading',
				terminalHeight: 6,
				hideExplorer: true,
				hideNavigation: true,
				theme: "dark",
				showSidebar: false,
				devToolsHeight: 0,
				hideDevTools: true,
			},
		);
	})

	const isReady = state( false )

	mounted(() => {
		const clear = () => clearInterval( interval )
		const interval = setInterval( async () => {
			if ( !_editor ) return
			const fs = await _editor.getFsSnapshot()
			if ( !('ready' in fs) ) return
			isReady.value = true
			step.value = 0;
			clear();
		}, 500)
		return clear
	})

	const step = state( -1 )

	let isFirst = true

	const docContent = state("")

	changed( async () => {
		let filePath = _stepFiles[ step.value ]
		if ( !_editor )
			return
		await _editor.editor.openFile( filePath )
		if ( isFirst ) {
			isFirst = false
			return
		}
		// Replace import in index.tsx
		const indexLines = stackFiles["index.tsx"].split("\n")
		filePath = filePath.split(".tsx")[0]
		indexLines[1] = `import('./${filePath}');`
		const indexRaw = indexLines.join("\n")
		await _editor.applyFsDiff({
			destroy: [],
			create: { 'index.tsx' : indexRaw },
		})
	})

	changed(() => {
		console.log(">>", isReady.value, step.value)
		if ( !isReady.value )
			return
		// Replace markdown documentation
		const docPath = _docsFiles[ step.value ]
		docContent.value = marked( stackFiles[docPath] ?? "", {
			async: false
		}) as string
		console.log( docContent.value );
	}, () => [isReady.value, step.value])

	function changeStep ( delta:number ) {
		step.value = limitRange( 0, step.value + delta, 2 )
	}
	const prevStep = () => changeStep(-1)
	const nextStep = () => changeStep(+1)
	const reset = async () => {
		const filePath = _stepFiles[ step.value ]
		const fileValue = stackFiles[ filePath ]
		const create = {}
		create[ filePath ] = fileValue
		await _editor.applyFsDiff({ destroy: [], create })
	}

	return () => <div class={ S.App }>
		<nav>

		</nav>
		<iframe id="iframe" class={ S._iframe } />
		{isReady.value && <div>
			<button onClick={ prevStep }>Prev</button>
			<button onClick={ nextStep }>Next</button>
			<button onClick={ reset }>Reset current file</button>
		</div>}
		<div innerHTML={ docContent.value } />
	</div>
}
