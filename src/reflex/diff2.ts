import { RenderFunction, VNode } from "./common";
import { createPropsProxy, IPropsProxy } from "./props";
import { _DOM_PRIVATE_LISTENERS_KEY } from "./diff";
import { unmounted } from "./lifecycle";

// ----------------------------------------------------------------------------- HELPERS

const _isEmpty = el => el == null || (Array.isArray(el) && !el.length)
const _isText = el => typeof el == "string" || typeof el == "number"
//const _isFunction = el => typeof el == "function"
//const _forceArray = <G>( item:G|G[] ):G[] => Array.isArray( item ) ? item : [ item ]
const _forceSingle = <G>( item:G|G[] ):G => Array.isArray( item ) ? item[0] : item
const _emptyString = ''

// ----------------------------------------------------------------------------- TYPES

export interface IDocument {
	createComment (data:string):Comment
	createTextNode (data:string):Text
	createElement (type:string):Element
}


export enum VNodeTypes {
	NODE,
	LIST,
	COMPONENT,
}

type ElementOrComment = Element|Comment

export interface INodeModel {
	type		:VNodeTypes
	dom			?:ElementOrComment
	children	?:INodeModel[]
	render		?:RenderFunction
	isFactory	?:boolean
	propsProxy	?:IPropsProxy<any>
	node		?:VNode
}

type VMountableNode = VNode|VNode[]|string|number

// ----------------------------------------------------------------------------- ATTRIBUTES

// Stolen from Preact, to check if a style props is non-dimensional (does not need to add a unit)
const _IS_NON_DIMENSIONAL_REGEX = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;

// Check if an event is a capture one
const _CAPTURE_REGEX = /Capture$/

function getEventNameAndKey ( name:string, dom:Element ) {
	// Note : Capture management stolen from Preact, thanks
	const useCapture = name !== ( name = name.replace(_CAPTURE_REGEX, '') );
	// Infer correct casing for DOM built-in events:
	const eventName = ( name.toLowerCase() in dom ? name.toLowerCase() : name ).slice(2)
	// Create unique key for this event
	const eventKey = eventName + (useCapture ? 'C' : '')
	return { eventName, eventKey, useCapture }
}

// Stolen from Preact, attach some style à key / value to a dom element
function setStyle ( style:CSSStyleDeclaration, key:string, value:string|null ) {
	if ( key[0] == '-' )
		style.setProperty(key, value);
	else if ( value == null )
		style[key] = '';
	// FIXME : IS_NON_DIMENSIONAL_REGEX -> Is it really necessary ?
	else if ( typeof value != "number" || _IS_NON_DIMENSIONAL_REGEX.test(key) )
		style[key] = value;
	else
		style[key] = value + 'px';
}

export function patchAttributes ( dom:Element, newNode:VNode, oldNode?:VNode ) {
	// Remove attributes which are removed from old node
	if ( oldNode ) for ( let name in oldNode.props ) {
		// Do not process children and remove only if not in new node
		if ( name == "children" ) continue
		if ( name in newNode.props && newNode.props[ name ] === oldNode.props[ name ] )
			continue;
		// Insert HTML directly without warning
		if ( name == "innerHTML" )
			dom.innerHTML = "" // FIXME : Maybe use delete or null ?
			// Events starts with "on". On preact this is optimized with [0] == "o"
		// But recent benchmarks are pointing to startsWith usage as faster
		else if ( name.startsWith("on") ) {
			const { eventName, eventKey, useCapture } = getEventNameAndKey( name, dom as Element );
			dom.removeEventListener( eventName, dom[ _DOM_PRIVATE_LISTENERS_KEY ][ eventKey ], useCapture )
		}
		// Other attributes
		else {
			dom.removeAttribute( name )
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
			dom.innerHTML = value
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
			if ( name == "style" && typeof value == "object" ) {
				// FIXME : Can it be optimized ? Maybe only setStyle when needed ?
				Object.keys( value ).map(
					k => setStyle( (dom as HTMLElement).style, k, value[k] )
				);
			}
			// Otherwise, apply as attribute
			else {
				// FIXME : What about checked / disabled / autoplay ...
				dom.setAttribute( name, value === true ? "" : value )
			}
		}
	}
}

// ----------------------------------------------------------------------------- INSERT / REMOVE ELEMENTS

export function insertDOM ( parent:Element, model:INodeModel, nextSibling?) {
	if ( model.type == VNodeTypes.NODE )
		parent.insertBefore( model.dom, nextSibling )
	else
		model.children.forEach( child => insertDOM(parent, child, nextSibling) )
}

export function removeDOM ( parent:Element, model:INodeModel ) {
	if ( model.type == VNodeTypes.NODE )
		parent.removeChild( model.dom )
	else
		model.children.forEach( child => removeDOM(parent, child) )
}

export function getDOMFromModel ( model:INodeModel ):ElementOrComment {
	return (
		( model.type === VNodeTypes.NODE )
		? model.dom
		: (model.children.length > 0 ? model.children[ 0 ].dom : null)
	);
}

// ----------------------------------------------------------------------------- MOUNT V-NODE

export function mountNode ( node:VMountableNode, document:IDocument ):INodeModel {
	// null or empty array -> empty comment to keep track of item in dom
	//const typeOfNode = typeof node
	// TODO : Can we optimize isArray / empty array here ?
	if ( _isEmpty(node) ) {
		return {
			type: VNodeTypes.NODE,
			dom: document.createComment( _emptyString ),
		}
	}
	// string or number -> text node as string
	else if ( _isText(node) ) {
		return {
			type: VNodeTypes.NODE,
			dom: document.createTextNode( _emptyString + node ),
		}
	}
	// non empty array
	else if ( Array.isArray(node) ) {
		return {
			type: VNodeTypes.LIST,
			children: node.map( child => mountNode(child, document) ),
		}
	}
	// object (regular dom element, functional components, factory components)
	else if ( typeof node == "object" ) {
		// Regular dom object ("div", "ul" ...)
		const typeOfVNodeObject = typeof node.type // fixme useful ?
		if ( typeOfVNodeObject == "string" ) {
			const dom = document.createElement( node.type as string )
			const children:INodeModel[] = (
				Array.isArray( node.props.children )
				? node.props.children.map( child => {
					const model = mountNode( child, document )
					insertDOM( dom, model )
					return model
				})
				: []
			)
			// TODO : SVG
			patchAttributes( dom, node )
			return {
				type: VNodeTypes.NODE,
				dom, children
			}
		}
		// Functional component or factory component
		else if ( typeOfVNodeObject == "function" ) {
			// Target render function
			let render = node.type as RenderFunction
			// Create props proxy
			const propsProxy = createPropsProxy( node.props )
			// Execute component (functional or factory)
			let result = render( propsProxy.proxy )
			// Check if returned value is a function or virtual nodes
			// Extract render function and execute render if factory component
			let isFactory = false
			if ( typeof result === "function" ) {
				render = result as RenderFunction
				result = render( propsProxy.proxy )
				isFactory = true
			}
			const firstChildNode = _forceSingle( result )
			const childModel = mountNode( firstChildNode, document )
			// TODO : Mounted component
			return {
				type: VNodeTypes.COMPONENT,
				render, isFactory, propsProxy,
				node: firstChildNode,
				children: [ childModel ]
			}
		}
	}
}

export function unmountModel ( model:INodeModel, document:IDocument ) {
	if ( Array.isArray(model.children) && model.children.length > 0 )
		model.children.forEach( child => unmountModel( child, document ) )
	if ( model.type === VNodeTypes.COMPONENT ) {
		// TODO : Unmounted component
	}
}



export function patchModel ( parent:Element, newNode:VMountableNode, oldNode:VMountableNode, model:INodeModel, document:IDocument ):INodeModel {
	console.log('PATCH MODEL', model, newNode, oldNode)
	// Same node or null node or empty array -> keep same model
	if ( newNode === oldNode || (_isEmpty(newNode) && _isEmpty(oldNode)) )
		return model; // fixme : continue;
	// Text node (string or number) -> apply new text
	else if ( _isText(newNode) && _isText(oldNode) )
		model.dom.nodeValue = newNode as string
	// Object node
	else if ( typeof newNode == "object" && typeof oldNode == "object" ) {
		newNode = newNode as VNode
		oldNode = oldNode as VNode
		console.log('->', model, newNode)
		const typeOfNewVNodeObject = typeof newNode.type
		const typeOfOldVNodeObject = typeof oldNode.type
		if (
			typeOfNewVNodeObject === "string" && typeOfOldVNodeObject === "string"
			&& typeOfNewVNodeObject === typeOfOldVNodeObject
		) {
			console.log('prout')
			patchAttributes( model.dom as Element, newNode, oldNode )
			let oldChildren = oldNode.props.children;
			let newChildren = newNode.props.children;
			if (oldChildren == null) {
				if (newChildren != null) {
					const childrenModel = mountNode(newChildren, document)
					model.children = [ childrenModel ]
					insertDOM( getDOMFromModel(model) as Element, childrenModel);
				}
			} else {
				if (newChildren == null) {
					getDOMFromModel(model).textContent = "";
					unmountModel(model, document);
					model.children = null;
				} else {
					const childrenModel = replaceModel(
						getDOMFromModel(model) as Element,
						newChildren, oldChildren,
						model,
						document
					);
					model.children = [ childrenModel ]
				}
			}
		}
		else if ( model.type === VNodeTypes.LIST ) {
			console.log('Children')
			patchChildren( parent, newNode.props.children, oldNode.props.children, model, document )
		}
		else {
			console.log('/', newNode.type, oldNode.type)
			if ( newNode.type === oldNode.type ) {
				// Same element type ("div", "ul" ...)
				// if ( typeOfNewVNodeObject == "string" ) {
				// 	patchAttributes( model.dom as Element, newNode, oldNode )
				// 	replaceModel( parent, newNode.props.children, oldNode.props.children, model, document )
				// }
				// Functional component or factory component
				// else if ( typeOfNewVNodeObject == "function" ) {
				if ( typeOfNewVNodeObject == "function" ) {
					// TODO : Should update props
					// TODO : Keep track of state update (increment a number ?)
					// TODO : And only update if states has changed or shouldUpdateProps is true
					const result = model.render( model.propsProxy.proxy )
					const firstChildNode = _forceSingle( result )
					console.log('RENDERED', firstChildNode)
					const childModel = patchModel(
						parent, firstChildNode, model.node, model.children[0], document
					)
					return Object.assign({}, model, {
						children: [ childModel ],
						node: newNode
					});
					// TODO : rendered component
				}
			}
		}
	}
	return model ? model : mountNode( newNode, document );
}

export function replaceModel ( parent:Element, newNode:VMountableNode, oldNode:VMountableNode, model:INodeModel, document:IDocument ) {
	const newModel = patchModel( parent, newNode, oldNode, model, document )
	if ( newModel !== model ) {
		insertDOM( parent, newModel, getDOMFromModel(model))
		removeDOM( parent, model )
		unmountModel( model, document )
	}
	return newModel
}


export function patchChildren ( parent:Element, newChildren, oldChildren, model:INodeModel, document:IDocument ) {
	console.log("patchChildren", model)
	// We need to retrieve the next sibling before the old children
	// get eventually removed from the current DOM document
	const nextNode = getDOMFromModel( model )?.nextSibling;
	const children = Array( newChildren.length );
	let modelChildren = model.children;
	let newStart = 0,
		oldStart = 0,
		newEnd = newChildren.length - 1,
		oldEnd = oldChildren.length - 1;

	let oldVNode:VNode, newVNode:VNode, oldModel:INodeModel, newModel:INodeModel
	let refMap:Map<string, INodeModel> = null;

	while ( newStart <= newEnd && oldStart <= oldEnd ) {
		if ( modelChildren[ oldStart ] === null ) {
			++oldStart;
			continue;
		}
		if ( modelChildren[ oldEnd ] === null ) {
			--oldEnd;
			continue;
		}

		oldVNode = oldChildren[ oldStart ];
		newVNode = newChildren[ newStart ];
		if ( newVNode?.key === oldVNode?.key ) {
			oldModel = modelChildren[ oldStart ];
			newModel = children[ newStart ] = replaceModel(
				parent, newVNode, oldVNode, oldModel, document
			);
			++newStart;
			++oldStart;
			continue;
		}

		oldVNode = oldChildren[ oldEnd ];
		newVNode = newChildren[ newEnd ];
		if ( newVNode?.key === oldVNode?.key ) {
			oldModel = modelChildren[ oldEnd ];
			newModel = children[ newEnd ] = replaceModel(
				parent, newVNode, oldVNode, oldModel, document
			);
			--newEnd;
			--oldEnd;
			continue;
		}

		if ( refMap === null ) {
			refMap = new Map();
			for ( let i = oldStart; i <= oldEnd; i++ ) {
				oldVNode = oldChildren[ i ];
				if ( oldVNode?.key != null )
					refMap[ oldVNode.key ] = i;
			}
		}

		newVNode = newChildren[ newStart ];
		const idx = newVNode?.key != null ? refMap[ newVNode.key ] : null;
		if ( idx != null ) {
			oldVNode = oldChildren[ idx ];
			oldModel = modelChildren[ idx ];
			newModel = children[ newStart ] = patchModel(
				parent, newVNode, oldVNode, oldModel, document
			);
			insertDOM( parent, newModel, getDOMFromModel( modelChildren[ oldStart ] ) );
			if ( newModel !== oldModel ) {
				removeDOM( parent, oldModel );
				unmountModel( oldModel, document );
			}
			modelChildren[ idx ] = null;
		}
		else {
			newModel = children[ newStart ] = mountNode( newVNode, document );
			insertDOM( parent, newModel, getDOMFromModel( modelChildren[ oldStart ] ) );
		}
		newStart++;
	}

	const beforeNode = (
		newEnd < newChildren.length - 1
		? getDOMFromModel( children[ newEnd + 1 ] )
		: nextNode
	)
	while ( newStart <= newEnd ) {
		const newRef = mountNode( newChildren[ newStart ], document );
		children[ newStart ] = newRef;
		insertDOM( parent, newRef, beforeNode );
		newStart++;
	}
	while ( oldStart <= oldEnd ) {
		oldModel = modelChildren[ oldStart ];
		if ( oldModel != null ) {
			removeDOM( parent, oldModel );
			unmountModel( oldModel, document );
		}
		oldStart++;
	}
	model.children = children;
}