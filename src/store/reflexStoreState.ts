import { IStore } from "./store";
import { mounted, state } from "../reflex";
import { IState } from "../reflex/states";


export function storeState <GType extends object> ( store:IStore<GType> ) : IState<GType>
{
	const data = state<GType>( store.getState() )
	mounted( () =>
		store.onAfter.add( () => data.set( store.getState() ) )
	)
	return data;
}
