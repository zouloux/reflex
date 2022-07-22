import { h, render, state } from "../../src/reflex";
import { trackPerformances, setReflexDebug } from "../../src/reflex/debug";
import { colorList, createUID, foodList, pickRandom } from "../common/demoHelpers";

// -----------------------------------------------------------------------------

interface IItem {
	id:string
	name:string
}

function ListItem (props) {
	const item:IItem = props.item
	return <li>{ item.id } : { item.name }</li>
}

const list = {
	value: []
}

function TestComponent () {
	// const list = state<IItem[]>([])

	function addItems () {
		const items = []
		for ( let i = 0; i < 10; i++ ) {
			items.push({
				id: createUID(),
				name: pickRandom( colorList ) + ' ' + pickRandom( foodList )
			})
		}
		list.value = [ ...list.value, ...items ]
		init();
	}
	console.log('TEST COMPONENT FACTORY', list.value)
	// addItems();
	// FIXME : Does not target correct node (it target first child)
	// return () => <div class={["TestComponent", list.value.length]}>
	return () => {
		console.log('TEST COMPONENT RENDER', list.value)
		return <div class={["TestComponent"]}>
			<button onClick={ addItems }>Add Items</button>
			<ul>
				{list.value.map( item =>
					<ListItem
						key={ item.id }
						item={ item }
					/>
				)}
			</ul>
			<span>{list.value.length}</span>
			{
				list.value.length > 0
					? <span>YES</span>
					: null
			}
		</div>
	}
}

interface IDevAppProps {
	emoji:string
}

function DevApp ( props:IDevAppProps ) {
	return <div class="Coucou">
		<h1>Hello {props.emoji}</h1>
		<TestComponent />
	</div>
}

// -----------------------------------------------------------------------------

setReflexDebug( true )

export function init () {
	const p = trackPerformances("Root rendering")
	const a = <DevApp emoji="✌️" />
	// console.log('A', a );
	render( a, document.getElementById('App') )
	// render( a, document.getElementById('App') )
	p();
}
init();
