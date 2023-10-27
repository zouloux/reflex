import {
	diffNode,
	getCurrentComponent,
	_getCurrentDiffingNode,
	_setDomAttribute,
	recursivelyUpdateMountState, _diffAndMount
} from "./diff";
import { _dispatch, _featureHooks, VNode, VNodeTypes } from "./common";
import { afterNextRender, ComponentInstance, unmounted } from "./component";

// ----------------------------------------------------------------------------- BATCHED TASK

// Micro task polyfill
const _microtask = self.queueMicrotask ?? ( h => self.setTimeout( h, 0 ) )

// type TTaskHandler <GType> = ( bucket:Set<GType> ) => void
type TTaskHandler <GType> = ( element:GType ) => void

// TODO : Doc
function _createBatchedTask <GType> ( task:TTaskHandler<GType> ) {
	const bucket = new Set<GType>()
	const resolves = []
	return ( element:GType, resolve?:() => any ) => {
		bucket.size || _microtask( () => {
			// task( bucket )
			for ( const element of bucket )
				task( element )
			bucket.clear()
			_dispatch( resolves )
		});
		bucket.add( element )
		resolve && resolves.push( resolve )
	}
}

// ----------------------------------------------------------------------------- PREPARE INITIAL VALUE

export type TInitialValue <GType> = GType | ((oldValue?:GType) => GType)

export const _prepareInitialValue = <GType> ( initialValue:TInitialValue<GType>, oldValue?:GType ) => (
	typeof initialValue == "function"
		? ( initialValue as (oldValue?:GType) => GType )(oldValue)
		: initialValue as GType
)

// ----------------------------------------------------------------------------- STATE TYPES

export type IState<GType> = {
	value:GType
	set ( newValue:TInitialValue<GType> ):Promise<void>

	peek ():GType
	sneak (value:GType):void

	readonly type:VNodeTypes

	toString ():string
	valueOf ():GType

	dispose ():void
}

export interface IComputeState<GType> extends IState<GType> {
	update ():void
}


export type TDisposeHandler = () => void

// It looks like PHPStorm does not like this one
export type TEffectHandler <
	GCheck extends any[] = [],
	// GArguments extends any[] = [ ...GCheck, ...GCheck ],
	GArguments extends any[] = GCheck,
> = ( ...rest:GArguments ) => TDisposeHandler|void|Promise<void>

type TCheckEffect<GCheck extends any[] = []> = () => GCheck


export type TComputed <GType> = () => GType

type TEffect<GCheck extends any[] = any[]> = {
	_check		:TCheckEffect<GCheck>|null
	_handler	:TEffectHandler<GCheck>
	_dom		:boolean
	_values		:GCheck
	_dispose	:TDisposeHandler
}


export interface IStateOptions<GType> {
	// filter				?:(newValue:GType, oldValue:GType) => GType,
	directInvalidation	?:boolean
}

// ----------------------------------------------------------------------------- INVALIDATE EFFECT

const _invalidateEffect = _createBatchedTask<TEffectHandler>( effect )

// ----------------------------------------------------------------------------- INVALIDATE COMPONENT

/**
 * Invalidate a component instance.
 * Will batch components in a microtask to avoid unnecessary renders.
 */
export const invalidateComponent = _createBatchedTask<ComponentInstance>(
	component => _diffAndMount( component.vnode, component.vnode, undefined, true )
);

// ----------------------------------------------------------------------------- STATE

// TODO : DOC
let _currentEffect:TEffect

// TODO : DOC
let _currentStates = new Set<IState<any>>()

/**
 * TODO : DOC
 * @param initialValue
 * @param stateOptions
 */
export function state <GType> (
	initialValue	?:TInitialValue<GType>,
	stateOptions	:Partial<IStateOptions<GType>> = {}
):IState<GType> {

	// Prepare initial value if it's a function
	initialValue = _prepareInitialValue( initialValue )

	// List of side effects / node / components to update
	const _effects = new Set<TEffect>()
	const _nodes = new Set<VNode>()
	const _components = new Set<ComponentInstance>()

	// Listen effects that create states
	if ( _currentEffect )
		_effects.add( _currentEffect )

	// Update the state value and dispatch changes
	async function updateValue ( newValue:GType, forceUpdate = false ) {
		// FIXME : Throw error in dev mode
		if ( !_effects )
			return
		// Halt update if not forced and if new value is same as previous
		if ( newValue === initialValue && !forceUpdate )
			return

		// Call dispose on all associated effects.
		// effect and changed
		for ( const effect of _effects )
			effect._dispose?.()

		// Store new value in
		// to the argument variable
		initialValue = newValue

		// Call all associated effect handlers ( not changed )
		// Do not attach effects // FIXME
		for ( const effect of _effects )
			!effect._dom && _callEffect( effect )

		// Then dispatch direct dom updates
		for ( const node of _nodes ) {
			// Skip this node if the whole component needs to be refreshed
			if ( !_components.has( node.component ) ) {
				// Do direct dom update
				if ( node.type === 3 )
					node.dom.nodeValue = initialValue as string
				else {
					// Reset attribute for "src", allow empty images when changing src
					if ( node.dom instanceof HTMLImageElement && node.key === "src" )
						_setDomAttribute( node.dom as Element, node.key, "" )
					_setDomAttribute( node.dom as Element, node.key, initialValue )
				}
				_dispatch( _featureHooks, null, 3/* MUTATING NODE */, node, node.key )
			}
		}

		// Dispatch all component refresh at the same time and wait for all to be updated
		const promises = []
		for ( const component of _components ) {
			// Refresh component synchronously
			if ( stateOptions.directInvalidation ) {
				diffNode( component.vnode, component.vnode )
				recursivelyUpdateMountState( component.vnode, true )
			}
			// Invalidate component asynchronously
			// FIXME : Resolve counter way to avoid Promise constructor here ? #perfs
			else
				promises.push( new Promise<void>(
					r => invalidateComponent( component, r )
				))
		}
		_components.clear();
		await Promise.all( promises )

		// Call all associated changed handler ( not effect )
		// Do not attach effects // FIXME
		for ( const effect of _effects )
			effect._dom && _invalidateEffect( () => _callEffect( effect ) )
	}

	// if this state is created into a factory phase of a component,
	// auto-dispose it on component unmount
	const dispose = unmounted(() => {
		// FIXME : For HMR, maybe delay it ? Maybe disable =null when hmr enabled ?
		// initialValue = null;
		_effects.clear()
		_nodes.clear()
		_components.clear()
	})

	const _localState = {
		// --- PUBLIC API ---
		// Get current value and register effects
		get value () {
			// FIXME : Throw error in dev mode
			if ( !_effects )
				return
			// Get current node and component
			const currentNode = _getCurrentDiffingNode()
			const currentComponent = getCurrentComponent()
			// Register current before effect handler
			if ( _currentEffect ) {
				_effects.add( _currentEffect )
				_currentStates.add( this )
			}
			// Register current text node
			else if ( currentNode && (currentNode.type === 3/* TEXT */ || currentNode.type === 2 /* ARGUMENT */) && currentNode.value === this ) {
				// Save component to current text node to optimize later
				currentNode.component = currentComponent
				_nodes.add( currentNode )
			}
			// Register current component
			else if ( currentComponent )
				_components.add( currentComponent )
			return initialValue as GType
		},
		// Set value with .value and update dependencies
		set value ( newValue:GType ) { updateValue( newValue ) },
		// Set value with a set() method and update dependencies
		// Asynchronous function
		set: ( newValue:TInitialValue<GType>, forceUpdate = false ) =>
			updateValue( _prepareInitialValue( newValue, initialValue as GType ), forceUpdate ),
		// Get value without registering effects
		peek () { return initialValue as GType },
		// Set value without calling effects
		sneak ( value:GType ) { initialValue = value },
		// Get type of this object
		get type () { return 3/*STATE*/ as VNodeTypes },
		// Use state as a getter without .value
		toString () { return this.value + '' },
		valueOf () { return this.value },
		// Remove and clean this state
		dispose,
		// --- PRIVATE API ---
		// @ts-ignore Private method for effect
		// Remove an effect handler
		_removeEffect ( effect:TEffect ) {
			_effects?.delete( effect )
		},
	}
	// Call hook for new state created
	_dispatch(_featureHooks, null, 4/* NEW STATE */, _localState, stateOptions)
	return _localState;
}

// ----------------------------------------------------------------------------- EFFECTS / CHANGED

function _detachEffectFromStates ( associatedStates:IState<any>[], effect:TEffect ) {
	// TODO : Dispose + register in component for later disposal
	// TODO : TEST + OPTIM
	for ( const state of associatedStates )
		// @ts-ignore
		state._removeEffect( effect )
}

function _captureAssociatedStates () {
	const associatedStates = Array.from( _currentStates )
	// Clear current states list
	_currentStates.clear()
	return associatedStates
}

function _callEffectHandler ( effect:TEffect, values?:any[] ) {
	// Call handler with old values
	const effectDispose = effect._handler( ...effect._values )
	// Register value as previous values after effect has been called
	effect._values = values
	// Save dispose function, override it if a function is not returned after
	effect._dispose = ( typeof effectDispose === "function" ? effectDispose : null )
}

function _callEffect ( effect:TEffect, attach = false ) {
	// Attach before check and handler
	if ( attach )
		_currentEffect = effect
	// If we have a check function, check values and attach on this function
	if ( effect._check ) {
		// Convert states to their values
		const values = effect._check().map( v => v && v.type === 3/* STATE */ ? v.value : v )
		// Detach after check so effect handler will not attach to states
		if ( attach )
			_currentEffect = null
		// Check if values changed. Never skip if those are the first values we have.
	 	if ( !effect._values.length || values.find((v, i) => effect._values[i] !== v) != null )
			 _callEffectHandler( effect, values )
	}
	else {
		// Run the handler once,
		_callEffectHandler( effect, [false] )
		// Detach after and handler
		if ( attach )
			_currentEffect = null
	}
}

function _createEffect <GCheck extends any[]> ( _handler:TEffectHandler<GCheck>, _check:TCheckEffect<GCheck>, _dom:boolean ):TEffect<GCheck> {
	// Register this effect as running so all states can catch the handler
	return {
		_handler,
		_check,
		_dom,
		// @ts-ignore
		_values: _check ? [] : [true],
		_dispose: null,
	}
}

// TODO : DOC
function _prepareEffect <GCheck extends any[]> ( handler:TEffectHandler<GCheck>, dom:boolean, check?:TCheckEffect<GCheck> ) {
	const _effect = _createEffect( handler, check, false )
	let _associatedStates:IState<any>[]
	function _run () {
		// Call effect now and attach to states
		_callEffect( _effect, true )
		// Clone associated states list to be able to detach later
		_associatedStates = _captureAssociatedStates()
	}
	dom ? afterNextRender( _run ) : _run()
	return unmounted( () => _detachEffectFromStates(_associatedStates, _effect) )
}

// TODO : DOC
export function effect <GCheck extends any[]> ( handler:TEffectHandler<[boolean]> ):TDisposeHandler {
	return _prepareEffect( handler, false )
}

// TODO : DOC
export function changed <GCheck extends any[]> ( handler?:TEffectHandler<[boolean]> ):TDisposeHandler {
	return _prepareEffect( handler, true )
}

// TODO : DOC
export function checkEffect <GCheck extends any[]> ( check:TCheckEffect<GCheck>, handler:TEffectHandler<GCheck>, ):TDisposeHandler {
	return _prepareEffect( handler, false, check)
}

// TODO : DOC
export function checkChanged <GCheck extends any[]> ( check:TCheckEffect<GCheck>, handler:TEffectHandler<GCheck>, ):TDisposeHandler {
	return _prepareEffect( handler, true, check)
}

// ----------------------------------------------------------------------------- COMPUTE

// TODO : DOC
export function compute <GType> ( handler:TComputed<GType> ):IComputeState<GType> {
	// FIXME : Can't we optimize state initialisation here ?
	const internalState:IComputeState<GType> = state<GType>() as IComputeState<GType>
	// FIXME : Async effect should work here
	internalState.update = () => internalState.set( handler() )
	const effectDispose = effect( internalState.update )
	const { dispose } = internalState
	internalState.dispose = unmounted(() => {
		effectDispose()
		dispose()
	})
	return internalState
}

// TODO : No need for batch if renders are batched ? Effect will not be batched.
// TODO : @see Preact signals API
//export function batch () {}