import { IRef, IRefs } from "./ref";
import { ComponentInstance } from "./component";

// ----------------------------------------------------------------------------- TYPES

// Declare global JSX override hack
// declare global {
// 	namespace JSX {
//
// 	}
// }

// ----------------------------------------------------------------------------- CONSTANTS

// Name of private node types which should not be created with JSX

export const _TEXT_NODE_TYPE_NAME = "#T"
export const _ROOT_NODE_TYPE_NAME = "#R"

// ----------------------------------------------------------------------------- POLYFILLS

// export const _microtask = ( window.queueMicrotask ?? ( h => window.setTimeout( h, 0 )) )

// ----------------------------------------------------------------------------- UTILS

// Force a list or a lonely item to be an array with the same type
// TODO : Into ecma-core + inline in bundle
// export const _forceArray = <G>( item:G|G[] ):G[] => Array.isArray( item ) ? item : [ item ]

// export const _typeof = (entity:any, firstLetterOfType:string) => (typeof entity)[0] == firstLetterOfType

// export const _isStringOrNumber = entity => ["s", "n"].indexOf( (typeof entity)[0] ) >= 0

// export function _flattenChildren ( vnode:VNode ) {
// 	// Re-assign flattened array to the original virtual node, and return it
// 	return vnode.props.children = (vnode.props.children.flat() ?? [])
// }

// ----------------------------------------------------------------------------- INTERNAL - CREATE COMPONENT

export type RenderDom = Element|Text

// FIXME : Cannot be VNode[] in current implementation.
// FIXME : Cannot be string in current implementation.
export type RenderFunction = (props?:object) => VNode
export type FunctionalComponent = RenderFunction
export type ComponentReturn = RenderFunction|VNode
export type FactoryComponent = (props?:object) => RenderFunction
export type ComponentFunction = FunctionalComponent|FactoryComponent

export type LifecycleHandler <GReturn = void> = (...rest) => GReturn
export type MountHandler = LifecycleHandler|LifecycleHandler<LifecycleHandler>


// ----------------------------------------------------------------------------- INITIAL VALUE
export type TInitialValue<GType> = GType | ((oldValue?:GType) => GType)

export const prepareInitialValue = <GType> ( initialValue:TInitialValue<GType>, oldValue?:GType ) => (
	typeof initialValue == "function" ? ( initialValue as (oldValue?:GType) => GType )(oldValue) : initialValue as GType
)

// ----------------------------------------------------------------------------- JSX H / CREATE ELEMENT

export type VNodeDomType = keyof (HTMLElementTagNameMap|SVGElementTagNameMap)
export type InternalVNodeTypes = typeof _ROOT_NODE_TYPE_NAME | typeof _TEXT_NODE_TYPE_NAME

export interface VNodeBaseProps {
	children	?:VNode[],
	key			?:string
	ref			?:IRef|IRefs
	pure		?:boolean
}

export interface VNode <
	GProps 	= VNodeBaseProps,
	GType 	= ( VNodeDomType | InternalVNodeTypes | ComponentFunction ),
> {
	type			:GType
	props			:GProps
	key				:string	// Allow numbers ?
	dom				?:RenderDom
	_keys			?:Map<string, VNode>
	_ref			?:IRef | IRefs
	_component		?:ComponentInstance
	_keep			?:boolean
	_id				?:number
}

export interface VTextNode extends VNode<{value:string}> {
	type		: typeof _TEXT_NODE_TYPE_NAME
}

// export type VNodeOrVNodes = VNode|VNode[]
