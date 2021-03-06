import {
	_TEXT_NODE_TYPE_NAME, RenderDom, RenderFunction, VNode,
	VNodeDomType, VTextNode, ComponentFunction, ComponentReturn
} from "./common";
import { _cloneVNode, _createVNode } from "./jsx";
import { IInternalRef } from "./ref";
import { ComponentInstance, _createComponentInstance, _recursivelyUpdateMountState } from "./component";

/**
 * TODO : Errors
 * - Disallow a component render function to return a component as main node !
 * 			() => <OtherComponent /> <- Forbidden
 * - Disallow a component which render an array
 * 			() => [<div />, <div />] <- Forbidden
 */

// ----------------------------------------------------------------------------- CONSTANTS

// Virtual node object is injected into associated dom elements with this name
export const _DOM_PRIVATE_VIRTUAL_NODE_KEY = "__v"

// Attached listeners to a dom element are stored in this array
export const _DOM_PRIVATE_LISTENERS_KEY = "__l"

// Stolen from Preact, to check if a style props is non-dimensional (does not need to add a unit)
const _IS_NON_DIMENSIONAL_REGEX = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

// Check if an event is a capture one
const _CAPTURE_REGEX = /Capture$/

// ----------------------------------------------------------------------------- CURRENT SCOPED COMPONENT

// We store current component in factory phase for hooks
let _hookedComponent:ComponentInstance = null
export function getHookedComponent ():ComponentInstance {
	if ( !_hookedComponent && process.env.NODE_ENV !== "production" )
		// throw new ReflexError(`getHookedComponent // Cannot use a factory hook outside of a factory component.`)
		throw new Error(`Reflex - getHookedComponent // Cannot use a factory hook outside of a factory component.`)
	return _hookedComponent
}

// ----------------------------------------------------------------------------- COMMON

function getEventNameAndKey ( name:string, dom:Element ) {
	// Note : Capture management stolen from Preact, thanks
	const useCapture = name !== ( name = name.replace(_CAPTURE_REGEX, '') );
	// Infer correct casing for DOM built-in events:
	const eventName = ( name.toLowerCase() in dom ? name.toLowerCase() : name ).slice(2)
	// Create unique key for this event
	const eventKey = eventName + (useCapture ? 'C' : '')
	return { eventName, eventKey, useCapture }
}

// Stolen from Preact, attach some style ?? key / value to a dom element
function setStyle ( style:CSSStyleDeclaration, key:string, value:string|null ) {
	if (key[0] === '-')
		style.setProperty(key, value);
	else if (value == null)
		style[key] = '';
	// FIXME : IS_NON_DIMENSIONAL_REGEX -> Is it really necessary ?
	// else if ( !_typeof(value, "n") || _IS_NON_DIMENSIONAL_REGEX.test(key) )
	else if ( typeof value != "number" || _IS_NON_DIMENSIONAL_REGEX.test(key) )
		style[key] = value;
	else
		style[key] = value + 'px';
}

function updateNodeRef ( node:VNode ) {
	node._ref && ( node._ref as IInternalRef )._setFromVNode( node as any )
}

// Shallow compare two objects, applied only for props between new and old virtual nodes.
// Will not compare "children" which is always different
// https://esbench.com/bench/62a138846c89f600a5701904
const shallowPropsCompare = ( a:object, b:object ) => (
	// Same amount of properties ?
	Object.keys(a).length === Object.keys(b).length
	// Every property exists in other object ?
	// Never test "children" property which is always different
	&& Object.keys(a).every( key => key === "children" || (b.hasOwnProperty(key) && a[key] === b[key]) )
)

// ----------------------------------------------------------------------------- DIFF ELEMENT

export function _diffElement ( newNode:VNode, oldNode:VNode ) {
	// console.log("diffElement", newNode, oldNode)
	const isTextNode = newNode.type == _TEXT_NODE_TYPE_NAME
	// Get dom element from oldNode or create it
	const dom:RenderDom = (
		oldNode ? oldNode.dom : (
			isTextNode
			? document.createTextNode( (newNode as VTextNode).props.value )
			: document.createElement( newNode.type as VNodeDomType )
		)
	)
	// Update text contents
	if ( isTextNode && oldNode ) {
		const { value } = (newNode as VTextNode).props;
		// Only when content has changed
		if ( value != (dom as Text).nodeValue )
			( dom as Text ).nodeValue = value
	}
	// Text nodes does not have attributes or events
	if ( isTextNode ) return dom
	// Remove attributes which are removed from old node
	if ( oldNode ) for ( let name in oldNode.props ) {
		// Do not process children and remove only if not in new node
		if ( name == "children" ) continue
		if ( name in newNode.props && newNode.props[ name ] === oldNode.props[ name ] )
			continue;
		// Insert HTML directly without warning
		if ( name == "innerHTML" )
			( dom as Element ).innerHTML = "" // FIXME : Maybe use delete or null ?
		// Events starts with "on". On preact this is optimized with [0] == "o"
		// But recent benchmarks are pointing to startsWith usage as faster
		else if ( name.startsWith("on") ) {
			const { eventName, eventKey, useCapture } = getEventNameAndKey( name, dom as Element );
			dom.removeEventListener( eventName, dom[ _DOM_PRIVATE_LISTENERS_KEY ][ eventKey ], useCapture )
		}
		// Other attributes
		else {
			( dom as Element ).removeAttribute( name )
		}
	}
	// Update props
	for ( let name in newNode.props ) {
		let value = newNode.props[ name ];
		if ( name == "children" || !value )
			continue;
		// Do not continue if attribute or event did not change
		if ( oldNode && name in oldNode.props && oldNode.props[ name ] === value )
			continue;
		// Insert HTML directly without warning
		if ( name == "innerHTML" )
			( dom as Element ).innerHTML = value
		// Events starts with "on". On preact this is optimized with [0] == "o"
		// But recent benchmarks are pointing to startsWith usage as faster
		else if ( name.startsWith("on") ) {
			const { eventName, eventKey, useCapture } = getEventNameAndKey( name, dom as Element );
			// Init a collection of handlers on the dom object as private property
			if (!dom[ _DOM_PRIVATE_LISTENERS_KEY ])
				dom[ _DOM_PRIVATE_LISTENERS_KEY ] = new Map();
			// Store original listener to be able to remove it later
			dom[ _DOM_PRIVATE_LISTENERS_KEY ][ eventKey ] = value;
			// And attach listener
			dom.addEventListener( eventName, value, useCapture )
		}
		// Other attributes, just set right on the dom element
		else {
			// className as class for non jsx components
			if ( name == "className" )
				name = "class"
			// Manage class as arrays
			if ( name == "class" && Array.isArray( value ) )
				value = value.filter( v => v !== true && !!v ).join(" ").trim()
			// Manage style as object only
			// else if ( name == "style" && _typeof(value, "o") )
			else if ( name == "style" && typeof value == "object" ) {
				// FIXME : Can it be optimized ? Maybe only setStyle when needed ?
				Object.keys( value ).map(
					k => setStyle( (dom as HTMLElement).style, k, value[k] )
				);
				continue;
			}
			// FIXME : What about checked / disabled / autoplay ...
			( dom as Element ).setAttribute( name, value === true ? "" : value )
		}
	}
	return dom;
}

// ----------------------------------------------------------------------------- DIFF CHILDREN

/**
 * Note about performances
 * - Very important, avoid loops in loops ! Prefer 4 static loops at top level
 *   rather than 2 nested loops. n*4 is lower than n^n !
 */
export function _diffChildren ( newParentNode:VNode, oldParentNode?:VNode ) {
	// Create key array on parent node to register keyed children
	// This will allow us to find any child by its key directly without
	// having to search for it
	function registerKey ( c:VNode ) {
		if ( !newParentNode._keys )
			newParentNode._keys = new Map()
		newParentNode._keys[ c.key ] = c
	}
	// Faster .flat
	// @see https://stackoverflow.com/questions/61411776/is-js-native-array-flat-slow-for-depth-1
	newParentNode.props.children = [].concat( ...newParentNode.props.children )
	// Faster for each loop
	let childIndex = -1
	const totalChildren = newParentNode.props.children.length
	while ( ++childIndex < totalChildren ) {
		let child = newParentNode.props.children[ childIndex ]
		// Convert string and numbers to text type nodes
		// We do it here because this is the first time we have to browse children
		// So it's not made into h() (later is better)
		if ( typeof child == "string" || typeof child == "number" )
			newParentNode.props.children[ childIndex ] = child = _createVNode( _TEXT_NODE_TYPE_NAME, { value: '' + child } )
		// If child is valid, register its keys
		if ( child ) {
			child.key && registerKey( child )
			// If no old parent node, add right now into dom
			if ( !oldParentNode ) {
				_diffNode( child )
				newParentNode.dom.appendChild( child.dom )
			}
		}
	}
	// Next, we check differences with old node.
	// So do not continue if there are no changes to check
	if ( !oldParentNode ) return
	const oldChildren = oldParentNode.props.children
	// Otherwise we need to compare between old and new tree
	const oldParentKeys = oldParentNode._keys
	let collapseCount = 0
	const parentDom = newParentNode.dom as Element
	// newParentNode.props.children.forEach( (newChildNode, i) => {
	const total = newParentNode.props.children.length
	for ( let i = 0; i < total; ++i ) {
		// Collapsed corresponding index between old and new nodes
		// To be able to detect moves or if just collapsing because a top sibling
		// has been removed
		// if ( lostIndexes[i] )
		const newChildNode = newParentNode.props.children[ i ]
		const oldAtSameIndex = oldChildren[ i ]
		if ( oldAtSameIndex && newParentNode._keys && oldAtSameIndex.key && !newParentNode._keys[ oldAtSameIndex.key ] )
			collapseCount ++
		/** REMOVED **/
		// If falsy, it's surely a child that has been removed with a ternary or a boolean
		// Do nothing else and do not mark old node to keep, so it will be removed
		if ( !newChildNode )
			return;
		// Has key, same key found in old, same type on both
		/** MOVE & UPDATE KEYED CHILD **/
		if (
			newChildNode.key
			&& oldParentKeys
			&& oldParentKeys[ newChildNode.key ]
			&& oldParentKeys[ newChildNode.key ].type == newChildNode.type
		) {
			const oldNode = oldParentKeys[ newChildNode.key ]
			_diffNode( newChildNode, oldNode )
			oldNode._keep = true;
			// Check if index changed, compare with collapsed index to detect moves
			const collapsedIndex = i + collapseCount
			// FIXME : Should do 1 operation when swapping positions, not 2
			// FIXME : Perf, is indexOf quick ? Maybe store every indexes in an array ?
			if ( oldChildren.indexOf( oldNode ) != collapsedIndex )
				parentDom.insertBefore( newChildNode.dom, parentDom.children[ collapsedIndex + 1 ] )
		}
		// Has key, but not found in old
		/** CREATE **/
		else if ( oldParentKeys && newChildNode.key && !oldParentKeys[ newChildNode.key ] ) {
			_diffNode( newChildNode )
			parentDom.insertBefore( newChildNode.dom, parentDom.children[ i ] )
			collapseCount --
		}
		// Found at same index, with same type.
		// Old node does not have a key.
		/** UPDATE IN PLACE **/
		else if ( i in oldChildren && oldChildren[ i ] && oldChildren[ i ].type == newChildNode.type ) {
			const oldNode = oldChildren[ i ]
			_diffNode( newChildNode, oldNode )
			oldNode._keep = true;
		}
		// Not found
		/** CREATE **/
		else {
			_diffNode( newChildNode )
			parentDom.insertBefore( newChildNode.dom, parentDom.children[ i ] )
			collapseCount --
		}
	}
	// Remove old children which are not reused
	for ( const oldChildNode of oldChildren ) {
		if ( oldChildNode && !oldChildNode._keep ) {
			// Call unmount handlers
			_recursivelyUpdateMountState( oldChildNode, false );
			// Remove ref
			const { dom } = oldChildNode
			oldChildNode.dom = null;
			updateNodeRef( oldChildNode )
			parentDom.removeChild( dom )
		}
	}
}

// ----------------------------------------------------------------------------- DIFF NODE

export function renderComponentNode <GReturn = ComponentReturn> ( node:VNode<null, ComponentFunction>, component:ComponentInstance ) :GReturn {
	// Tie component and virtual node
	component.vnode = node
	node._component = component
	// Select hooked component
	_hookedComponent = component;
	// FIXME: Before render handlers ?
	// FIXME: Optimize rendering with a hook ?
	// Execute rendering
	component._isRendering = true
	const render = component._render ? component._render : node.type as RenderFunction
	const result = render.apply( component, [ component._propsProxy.proxy ])
	component._isRendering = false
	// Unselect hooked component
	_hookedComponent = null
	return result as GReturn
}

export function _diffNode ( newNode:VNode, oldNode?:VNode ) {
	// IMPORTANT : Here we clone node if we got the same instance
	// 			   Otherwise, altering props.children after render will fuck everything up
	// Clone identical nodes to be able to diff them
	if ( oldNode && oldNode === newNode )
		newNode = _cloneVNode( oldNode )
	// Transfer component instance from old node to new node
	let component:ComponentInstance = oldNode?._component
	// Transfer id
	if ( oldNode && oldNode._id )
		newNode._id = oldNode._id
	// We may need a new component instance
	let renderResult:VNode
	// if ( !component && _typeof(newNode.type, "f") ) {
	if ( !component && typeof newNode.type == "function" ) {
		// Create component instance (without new keyword for better performances)
		component = _createComponentInstance( newNode as VNode<null, ComponentFunction> )
		// Execute component's function and check what is returned
		const result = renderComponentNode( newNode as VNode<null, ComponentFunction>, component )
		// This is a factory component which return a render function
		// if ( _typeof(result, "f") ) {
		if ( typeof result == "function" ) {
			component._render = result as RenderFunction
			component.isFactory = true
		}
		// This is pure functional component which returns a virtual node
		// else if ( _typeof(result, "o") && "type" in result ) {
		else if ( typeof result == "object" && "type" in result ) {
			component._render = newNode.type as RenderFunction
			component.isFactory = false
			renderResult = result
		}
	}
	let dom:RenderDom
	// Virtual node is a dom element
	if ( !component ) {
		newNode.dom = dom = _diffElement( newNode, oldNode )
	}
	// Virtual node is a component
	else {
		// FIXME : Is it a good idea to shallow compare props on every changes by component ?
		// 			-> It seems to be faster than preact + memo with this ????, check other cases
		// TODO : Maybe do not shallow by default but check if component got an "optimize" function
		//			which can be implemented with hooks. We can skip a lot with this !
		// FIXME : Does not work if props contain dynamic arrow functions :(
		//			<Sub onEvent={ e => handler(e, i) } />
		//			Here the handler is a different ref at each render
		// If props did not changed between old and new
		// Only optimize pure components, factory components mau have state so are not pure
		if (
			// If pure functional component has not already been rendered
			!renderResult
			// Need to be a component update, on a pure functional component,
			&& oldNode && !component.isFactory // && !component.isDirty
			// New component isn't marked as not pure
			&& newNode.props.pure !== false // FIXME : Rename it forceRefresh={ true } ?
			// Cannot optimize components which have children properties
			// Because parent component may have altered rendering of injected children
			&& newNode.props.children.length === 0
			// Do shallow compare
			&& shallowPropsCompare( newNode.props, oldNode.props )
		) {
			// FIXME : Weirdly, it seems to optimize not all components
			//			Ex : click on create 1000 several times and watch next console log
			// console.log("OPTIMIZE")
			// Do not re-render, just get children and dom from old node
			// newNode.props.children = [ ...oldNode.props.children ]
			newNode.props.children = oldNode.props.children
			newNode.dom = dom = oldNode.dom
		}
		// Not already rendered, and no optimization possible. Render now.
		else if ( !renderResult ) {
			component._propsProxy.set( newNode.props )
			renderResult = renderComponentNode<VNode>( newNode as VNode<null, ComponentFunction>, component )
		}
		// We rendered something (not reusing old component)
		if ( renderResult ) {
			// Apply new children list to the parent component node
			// FIXME :
			newNode.props.children = renderResult.props.children
			// newNode.props.children = _flattenChildren( renderResult )

			// Diff rendered element
			newNode.dom = dom = _diffElement( renderResult, oldNode )
			// Assign ref of first virtual node to the component's virtual node
			newNode._ref = renderResult._ref
		}
		// Tie up node and component
		newNode._component = component
		component.vnode = newNode as any
		// Component is clean and rendered now
		component._isDirty = false
	}
	// Update ref on node
	updateNodeRef( newNode )
	// Diff children of this element (do not process text nodes)
	if ( dom instanceof Element )
		_diffChildren( newNode, oldNode )
	// If component is not mounted yet, mount it recursively
	if ( component && !component.isMounted )
		_recursivelyUpdateMountState( newNode, true )
	// Execute after render handlers
	component?._renderHandlers.map( h => h() )
}
