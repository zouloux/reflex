// import { h, render, state, DefaultReflexBaseProps, shouldUpdate } from "reflex-dom"
import {
	h,
	state,
	shouldUpdate,
} from "../../../reflex-dom/src"
import { For } from "../../../reflex-dom/src/jsx-helpers"

// ----------------------------------------------------------------------------- DEBUG

// @ts-ignore
let memoryDebugger
import { drawReflexDebug, MemoryUsage } from "../../../reflex-dom/src/debug";
if ( process.env.NODE_ENV !== 'production' ) {
	drawReflexDebug();
	memoryDebugger = <MemoryUsage />
}

// ----------------------------------------------------------------------------- DATA HELPERS

const A = [
	"pretty", "large", "big", "small", "tall", "short", "long", "handsome",
	"plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful",
	"mushy", "odd", "unsightly", "adorable", "important", "inexpensive",
	"cheap", "expensive", "fancy"
];
const C = [
	"red", "yellow", "blue", "green", "pink", "brown", "purple", "brown",
	"white", "black", "orange"
];
const N = [
	"table", "chair", "house", "bbq", "desk", "car", "pony", "cookie",
	"sandwich", "burger", "pizza", "mouse", "keyboard"
];

const _pick = array => array[Math.floor(Math.random() * array.length)]

// ----------------------------------------------------------------------------- STRUCT & STATES

interface IDataItem
{
	id		:number
	label	:string
}

const $data = state<IDataItem[]>([])
const $selected = state<number>( null )

// ----------------------------------------------------------------------------- DATA ACTIONS

const run = () => $data.set( buildData(1000) )
const runLots = () => $data.set( buildData(10000) )
const add = () => $data.set( d => [...d, ...buildData(1000)] )
const update = () => $data.set( d => {
	for ( let i = 0, len = d.length; i < len; i += 10 )
		d[i].label += ' !!!';
	return [...d]
})
const clear = () => $data.set([])
const swapRows = () => $data.set( d => {
	if ( d.length > 998 ) {
		let tmp = d[1];
		d[1] = d[998];
		d[998] = tmp;
		return [...d];
	}
	return d
})
const remove = id => $data.set(d => {
	const idx = d.findIndex( d => d.id === id );
	return [ ...d.slice(0, idx), ...d.slice(idx + 1) ];
})
const toggleSelection = ( id:number ) => {
	$selected.set( $selected.value === id ? null : id )
}

// ----------------------------------------------------------------------------- BUILD DATA

let _counter = 1;
const buildData = (count:number) => {
	const data = new Array(count);
	for ( let i = 0; i < count; i++ ) {
		data[i] = {
			id: _counter++,
			label: `${_pick(A)} ${_pick(C)} ${_pick(N)}`,
		};
	}
	return data;
};

const getItemByID = ( id ) => $data.value.find( item => item.id === id )

// ----------------------------------------------------------------------------- BUTTON

function Button ({ id, onClick, title }) {
	return <div class="col-sm-6 smallpad">
		<button
			type="button"
			class="btn btn-primary btn-block"
			id={ id } onClick={ onClick }
			children={[ title ]}
		/>
	</div>
}

// ----------------------------------------------------------------------------- ROW

// interface IRowProps extends DefaultReflexBaseProps, IDataItem
// {
//
// }

// const rowShouldUpdate = (newProps:IRowProps, oldProps:IRowProps) => (
// 	// oldProps.isSelected !== newProps.isSelected
// 	oldProps.class !== newProps.class
// 	|| oldProps.label !== newProps.label
// )

// function Row2 ( props ) {
// 	// shouldUpdate( rowShouldUpdate )
// 	shouldUpdate( false )
// 	const selectedClass = compute( () => $selected.value === props.key ? "danger" : "" )
// 	const label = compute( () => {
// 		const item = getItemByID( props.key )
// 		return item ? item.label : null
// 	} )
// 	return () => <tr class={ selectedClass }>
// 		<td class="col-md-1">{ props.key }</td>
// 		<td class="col-md-4">
// 			<a onClick={ () => toggleSelection( props.key ) }>
// 				{ label }
// 			</a>
// 		</td>
// 		<td class="col-md-1">
// 			<a onClick={ () => remove( props.key ) }>
// 				<span class="glyphicon glyphicon-remove" aria-hidden="true" />
// 			</a>
// 		</td>
// 		<td class="col-md-6" />
// 	</tr>
// }

function Row ( props ) {
	shouldUpdate((newProps, oldProps) => (
		oldProps.selected !== newProps.selected
		|| oldProps.label !== newProps.label
	))
	return () => <tr class={ props.selected ? "danger" : "" }>
		<td class="col-md-1">{ props.id }</td>
		<td class="col-md-4">
			<a onClick={ () => toggleSelection( props.id ) }>
				{ props.label }
			</a>
		</td>
		<td class="col-md-1">
			<a onClick={ () => remove( props.id ) }>
				<span class="glyphicon glyphicon-remove" aria-hidden="true" />
			</a>
		</td>
		<td class="col-md-6" />
	</tr>
}


// ----------------------------------------------------------------------------- JUMBOTRON

function Jumbotron () {
	return <div class="jumbotron">
		<div class="row">
			<div class="col-md-6">
				<h1>Reflex-DOM keyed</h1>
			</div>
			<div class="col-md-6">
				<div class="row">
					<Button id="run" title="Create 1,000 rows" onClick={ run } />
					<Button id="runlots" title="Create 10,000 rows" onClick={ runLots } />
					<Button id="add" title="Append 1,000 rows" onClick={ add } />
					<Button id="update" title="Update every 10th row" onClick={ update } />
					<Button id="clear" title="Clear" onClick={ clear } />
					<Button id="swaprows" title="Swap Rows" onClick={ swapRows } />
				</div>
			</div>
		</div>
	</div>
}

// ----------------------------------------------------------------------------- APP

export function App () {
	return () => <div class="container">
		{ memoryDebugger }
		<Jumbotron />
		<table class="table table-hover table-striped test-data">
			<For each={ $data } as="tbody">
				{item => <Row
					key={ item.id }
					id={ item.id }
					label={ item.label }
					selected={ $selected.value === item.id }
				/>}
			</For>
		</table>
		<span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true" />
	</div>
}

//render(<App />, document.getElementById("main"))
