import { _ROOT_NODE_TYPE_NAME, VNode } from "./common";
import { _diffChildren, _diffNode, _DOM_PRIVATE_VIRTUAL_NODE_KEY, renderComponentNode } from "./diff";
import { _createVNode } from "./jsx";
import { ComponentInstance } from "./component";
import { INodeModel, insertDOM, mountNode, patchModel } from "./diff2";

// ----------------------------------------------------------------------------- RENDER

// export function render ( rootNode:VNode, parentElement:HTMLElement ) {
// 	// When using render, we create a new root node to detect new renders
// 	// This node is never rendered, we just attach it to the parentElement and render its children
// 	const root = _createVNode( _ROOT_NODE_TYPE_NAME, { children: [rootNode] } )
// 	root.dom = parentElement
// 	_diffChildren( root, parentElement[ _DOM_PRIVATE_VIRTUAL_NODE_KEY ] )
// 	parentElement[ _DOM_PRIVATE_VIRTUAL_NODE_KEY ] = root
// }

interface IRootNodeRef {
	ref		:INodeModel
	node	:VNode
}

export function render ( node:VNode, parentElement:HTMLElement ) {
	let rootNodeRef:IRootNodeRef = parentElement[ _DOM_PRIVATE_VIRTUAL_NODE_KEY ];
	if ( rootNodeRef ) {
		patchModel( parentElement, node, rootNodeRef.node, rootNodeRef.ref, document )
	}
	else {
		const ref = mountNode( node, document )
		rootNodeRef = { ref, node }
		parentElement[ _DOM_PRIVATE_VIRTUAL_NODE_KEY ] = rootNodeRef;
		insertDOM( parentElement, ref )
	}
}

// ----------------------------------------------------------------------------- INVALIDATION

let componentsToUpdate:ComponentInstance[] = []
function updateDirtyComponents () {
	let p
	if ( process.env.NODE_ENV !== "production" )
		p = require("./debug").trackPerformances("Update dirty components")
	// TODO : Update with depth ! Deepest first ? Or last ?
	componentsToUpdate.forEach( component => {
		_diffNode( component.vnode, component.vnode )
		// if ( component._affectedNodesByStates.length == 0 )
		// 	_diffNode( component.vnode, component.vnode )
		// else for ( let i = 0; i < component._affectedNodesByStates.length; ++i ) {
		// 	const oldNodes = component._affectedNodesByStates[ i ]
		// 	component._affectedNodesByStates[i] = []
		// 	renderComponentNode( component.vnode, component )
		// 	const newNodes = component._affectedNodesByStates[ i ]
		// 	for ( let j = 0; j < newNodes.length; ++j )
		// 		_diffNode( newNodes[j], oldNodes[j] )
		// }
		component._afterRenderHandlers.forEach( handler => handler() )
		component._afterRenderHandlers = []
	})
	componentsToUpdate = []
	p && p();
}

const __microtask = self.queueMicrotask ? self.queueMicrotask : h => self.setTimeout( h, 0 )

export function invalidateComponent ( dirtyComponent:ComponentInstance ) {
	// Queue rendering before end of frame
	if ( componentsToUpdate.length === 0 )
		__microtask( updateDirtyComponents );
	// Invalidate this component once
	if ( dirtyComponent._isDirty ) return;
	dirtyComponent._isDirty = true
	// Store it into the list of dirty components
	componentsToUpdate.push( dirtyComponent )
}

// ----------------------------------------------------------------------------- REGISTER WEB-COMPONENTS

// TODO : Web components ! Check how lit and preact webcomponents works
//			- Register web-components with ComponentName to <component-name />
//  		- Update properties when changed in DOM
//  			- Need translation (detect numbers, maybe json for array and objects ?)
//				- Maybe an API to set props with JS and with advanced type (like functions)
//			- Children
//			- DOM Find
//			- Mount / Unmount

// ----------------------------------------------------------------------------- HYDRATE

// TODO : Hydrate
// TODO : Render to string or render to web components to avoid expensive hydratation ?

