import { prepareInitialValue, TInitialValue } from "./common";
import { _diffNode, getHookedComponent } from "./diff";
// import { addDataListenerForNextNode } from "./jsx";
import { invalidateComponent } from "./render";


export type IAsyncState<GType> = {
	value:GType
	set ( newValue:TInitialValue<GType> ):Promise<void>
}


export function state <GType> (
	initialValue	?:TInitialValue<GType>,
	filter			?:(newValue:GType, oldValue:GType) => GType,
	afterChange		?:(newValue:GType) => void,
):IAsyncState<GType> {
	initialValue = prepareInitialValue( initialValue )
	const component = getHookedComponent()
	// const affectedNodesIndex = component._affectedNodesByStates.push([]) - 1
	return {
		get value () {
			// if ( component._isRendering ) {
			// 	addDataListenerForNextNode( node => {
			// 		console.log('>', component._affectedNodesByStates[affectedNodesIndex].length, node)
			// 		component._affectedNodesByStates[affectedNodesIndex].push( node )
			// 	})
			// }
			return initialValue as GType
		},
		set value ( newValue:GType ) {
			initialValue = filter ? filter( newValue, initialValue as GType ) : newValue
			invalidateComponent( component )
			afterChange && component._afterRenderHandlers.push( () =>
				afterChange( initialValue as GType )
			)
		},
		async set ( newValue:TInitialValue<GType> ) {
			return new Promise( resolve => {
				newValue = prepareInitialValue<GType>( newValue, initialValue as GType )
				initialValue = filter ? filter( newValue, initialValue as GType ) : newValue
				component._afterRenderHandlers.push(() => {
					resolve();
					afterChange && afterChange( initialValue as GType )
				})
				invalidateComponent( component )
			})
		}
	}
}


export type ISyncState<GType> = {
	value:GType
}

export function syncState <GType> (
	initialValue	?:TInitialValue<GType>,
	filter			?:(newValue:GType, oldValue:GType) => GType,
):ISyncState<GType> {
	initialValue = prepareInitialValue( initialValue )
	const component = getHookedComponent()
	// const affectedNodesIndex = component._affectedNodesByStates.push([]) - 1
	return {
		get value () {
			// if ( component._isRendering ) {
			// 	addDataListenerForNextNode( node => {
			// 		console.log('>', component._affectedNodesByStates[affectedNodesIndex].length, node)
			// 		component._affectedNodesByStates[affectedNodesIndex].push( node )
			// 	})
			// }
			return initialValue as GType
		},
		set value ( newValue:GType ) {
			initialValue = filter ? filter( newValue, initialValue as GType ) : newValue
			_diffNode( component.vnode, component.vnode )
		}
	}
}
