import { VNode } from "./common";

// FIXME : Is it an array ? Maybe its working as single prop
let _dataListenersForNextNode = []

export function addDataListenerForNextNode ( listener ) {
	_dataListenersForNextNode.push( listener )
}

function triggerDataListenerForNode ( node:VNode ) {
	_dataListenersForNextNode.forEach( handler => handler( node ) )
	_dataListenersForNextNode = []
}

// NOTE : Keep it in a function and do not inline this
// It seems to be V8 optimized. @see Preact source code
export function _createVNode ( type, props, key?, _ref? ):VNode {
	if ( process.env.NODE_ENV != "production" ) {
		delete props.__source
		delete props.__self
	}
	const node:VNode = { type, props, key, _ref }
	// triggerDataListenerForNode( node )
	return node;
}

export function _cloneVNode ( vnode:VNode ) {
	const newNode = Object.assign({}, vnode)
	// IMPORTANT : also clone props object
	newNode.props = Object.assign({}, vnode.props)
	// triggerDataListenerForNode( newNode )
	return newNode
}

export function h ( type, props:any, ...children ) {
	if ( props == null ) props = {}
	props.children = props.children ? props.children : children
	const node = _createVNode( type, props, props.key, props.ref )
	// triggerDataListenerForNode( node )
	return node;
}

// TRACKING TEST
/*
let $ = []
let a = 0

h('div', {}, [
	h('h1', {className: $}, [ 	// -> h1
		"Content ", $			// -> h1
	]),
	h('ul', {}, $.map( a => a )),// -> ul
	h('p', {}, [$]),			// -> p
	a ? $ : null				// -> div
])
*/
