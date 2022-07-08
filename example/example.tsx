// Import it like any other v-dom lib
import { h, render, state, changed, ref, mounted } from "../src/reflex";

// Reflex components can be pure functions or factory functions
function ReflexApp ( props ) {
	// How basic state works
	const counter = state( 0 )
	const increment = () => counter.set( counter.value + 1 )
	const reset = () => counter.set( 0 )

	// No need to use ref for locally scoped variables
	let firstUpdate = true
	// Detect changes of states or props
	changed(() => [counter.value], newValue => {
		console.log(`Counter just updated to ${newValue}`, firstUpdate)
		firstUpdate = false
	})

	// How refs of dom elements works
	const title = ref()
	mounted(() => console.log(title.dom.innerHTML) )

	// Returns a render function
	// Classes can be arrays ! Falsy elements of the array will be discarded
	return () => <div class={[ "ReflexApp", props.modifier, false ]}>
		<h1 ref={ title }>Hello from Reflex { props.emoji }</h1>
		<button onClick={ increment }>Increment</button>&nbsp;
		<button onClick={ reset }>Reset</button>&nbsp;
		<span>Counter : { counter.value }</span>
	</div>
}

// Render it like any other v-dom library
render( <ReflexApp modifier="ReflexApp-darkMode" emoji="👋" />, document.body )