function e( e, t, n, r )
{
	Object.defineProperty( e, t, { get: n, set: r, enumerable: !0, configurable: !0 } )
}

var t = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : "undefined" != typeof global ? global : {},
	n = {}, r = {}, o = t.parcelRequirea1a1;
null == o && ( ( o = function ( e ) {
	if ( e in n ) return n[ e ].exports;
	if ( e in r )
	{
		var t = r[ e ];
		delete r[ e ];
		var o = { id: e, exports: {} };
		return n[ e ] = o, t.call( o.exports, o, o.exports ), o.exports
	}
	var s = new Error( "Cannot find module '" + e + "'" );
	throw s.code = "MODULE_NOT_FOUND", s
} ).register = function ( e, t ) {
	r[ e ] = t
}, t.parcelRequirea1a1 = o ), o.register( "leUMy", ( function ( t, n ) {
	e( t.exports, "render", ( () => o( "vCAeY" ).render ) ), e( t.exports, "h", ( () => o( "fhfO5" ).h ) ), e( t.exports, "state", ( () => o( "74FVx" ).state ) ), e( t.exports, "ref", ( () => o( "1VBx6" ).ref ) ), e( t.exports, "refs", ( () => o( "1VBx6" ).refs ) ), e( t.exports, "mounted", ( () => o( "jqVIl" ).mounted ) ), e( t.exports, "unmounted", ( () => o( "jqVIl" ).unmounted ) ), e( t.exports, "changed", ( () => o( "jqVIl" ).changed ) ), o( "2rWHf" ), o( "74FVx" ), o( "1VBx6" ), o( "jqVIl" );
	o( "vCAeY" ), o( "fhfO5" )
} ) ), o.register( "2rWHf", ( function ( t, n ) {
	e( t.exports, "_TEXT_NODE_TYPE_NAME", ( () => r ) ), e( t.exports, "_ROOT_NODE_TYPE_NAME", ( () => o ) ), e( t.exports, "ReflexError", ( () => s ) ), e( t.exports, "microtask", ( () => i ) ), e( t.exports, "forceArray", ( () => p ) ), e( t.exports, "flattenChildren", ( () => a ) );
	const r = "#Text", o = "#Root";

	class s extends Error
	{
	}

	const i = window.queueMicrotask ?? ( e => window.setTimeout( e, 0 ) ), p = e => Array.isArray( e ) ? e : [ e ];

	function a( e )
	{
		return e.props.children = e.props?.children?.flat() ?? []
	}
} ) ), o.register( "74FVx", ( function ( t, n ) {
	e( t.exports, "state", ( () => p ) );
	var r = o( "4xUDA" ), s = o( "vCAeY" ), i = o( "f58w7" );

	function p( e )
	{
		const t = ( 0, r.getHookedComponent )(),
			n = ( 0, i.createStateObservable )( e, ( () => ( 0, s.invalidateComponent )( t ) ) );
		return t._observables.push( n ), n
	}
} ) ), o.register( "4xUDA", ( function ( t, n ) {
	e( t.exports, "_DOM_PRIVATE_VIRTUAL_NODE_KEY", ( () => p ) ), e( t.exports, "getHookedComponent", ( () => c ) ), e( t.exports, "diffChildren", ( () => _ ) ), e( t.exports, "diffNode", ( () => h ) );
	var r = o( "2rWHf" ), s = o( "fhfO5" ), i = o( "fwkQu" );
	const p = "__v", a = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, l = /Capture$/;
	let u = null;

	function c()
	{
		return u
	}

	function d( e, t )
	{
		const n = e !== ( e = e.replace( l, "" ) ), r = ( e.toLowerCase() in t ? e.toLowerCase() : e ).slice( 2 );
		return { eventName: r, eventKey: r + ( n ? "C" : "" ), useCapture: n }
	}

	function f( e )
	{
		e._ref && ( "list" in e._ref ? e._ref.setFromVNode( 0, e ) : e._ref.setFromVNode( e ) )
	}

	function m( e, t )
	{
		const n = e.type == r._TEXT_NODE_TYPE_NAME,
			o = t ? t.dom : n ? document.createTextNode( e.props.value ) : document.createElement( e.type );
		if ( n && t )
		{
			const { value: t } = e.props;
			t != o.nodeValue && ( o.nodeValue = t )
		}
		return n || ( t && Object.keys( t.props ).map( ( n => {
			if ( "children" !== n && ( !( n in e.props ) || e.props[ n ] !== t.props[ n ] ) ) if ( "innerHTML" === n ) o.innerHTML = ""; else if ( n.startsWith( "on" ) )
			{
				const { eventName: e, eventKey: t, useCapture: r } = d( n, o );
				o.removeEventListener( e, o.__l[ t ], r )
			} else o.removeAttribute( n )
		} ) ), Object.keys( e.props ).map( ( n => {
			if ( "children" === n ) return;
			let r = e.props[ n ];
			if ( !t || !( n in t.props ) || t.props[ n ] !== r ) if ( "innerHTML" === n ) o.innerHTML = r; else if ( n.startsWith( "on" ) )
			{
				const { eventName: e, eventKey: t, useCapture: s } = d( n, o );
				o.__l ??= new Map, o.__l[ t ] = r, o.addEventListener( e, r, s )
			} else
			{
				if ( "className" === n && ( n = "class" ), "class" === n && Array.isArray( r ) ) r = r.filter( ( e => !0 !== e && !!e ) ).join( " " ).trim(); else
				{
					if ( "style" === n && "object" == typeof r ) return Object.keys( r ).map( ( e => function ( e, t, n ) {
						"-" === t[ 0 ] ? e.setProperty( t, n ) : null == n ? e[ t ] = "" : "number" != typeof n || a.test( t ) ? e[ t ] = n : e[ t ] = n + "px"
					}( o.style, e, r[ e ] ) ) );
					if ( !1 === r ) return
				}
				o.setAttribute( n, r )
			}
		} ) ) ), o
	}

	function _( e, t )
	{
		const n = e.props.children?.flat(), r = t?.props.children?.flat();
		if ( !n ) return;
		const o = e.dom;
		e._keys = new Map;
		const s = t => {
			t?.key && ( e._keys[ t.key ] = t )
		};
		if ( !r ) return void n.map( ( e => {
			e && ( h( e ), o.appendChild( e.dom ), s( e ) )
		} ) );
		n.map( s );
		const p = r.map( ( t => !( !t?.key || e._keys[ t.key ] ) ) ), a = t._keys;
		let l = 0;
		n.map( ( ( e, t ) => {
			if ( p[ t ] && l++, e ) if ( e.key && a[ e.key ] && a[ e.key ].type == e.type )
			{
				const n = a[ e.key ];
				h( e, n ), n.keep = !0;
				const s = t + l;
				r.indexOf( n ) != s && o.insertBefore( e.dom, o.children[ t ] )
			} else if ( e.key && !a[ e.key ] ) h( e ), o.insertBefore( e.dom, o.children[ t ] ), l--; else if ( t in r && r[ t ] && r[ t ].type == e.type )
			{
				const n = r[ t ];
				h( e, n ), n._keep = !0
			} else h( e ), o.insertBefore( e.dom, o.children[ t ] ), l--
		} ) ), r.map( ( e => {
			if ( e && !e._keep )
			{
				( 0, i.recursivelyUpdateMountState )( e, !1 );
				const { dom: t } = e;
				e.dom = null, f( e ), o.removeChild( t )
			}
		} ) )
	}

	function y( e, t )
	{
		t.vnode = e, e._component = t, u = t;
		const n = ( t._render ?? e.type ).apply( t, [ t._propsProxy.value ] );
		return u = null, n
	}

	function h( e, t )
	{
		t && t === e && ( e = ( 0, s.cloneVNode )( t ) );
		let n, o, p = t?._component;
		if ( !p && "function" == typeof e.type )
		{
			p = ( 0, i.createComponentInstance )( e );
			const t = y( e, p );
			"function" == typeof t ? ( p._render = t, p.isFactory = !0 ) : "object" == typeof t && "type" in t && ( p._render = e.type, p.isFactory = !1, n = t )
		}
		var a, l;
		p ? ( !n && t && !p.isFactory && !1 !== e.props.pure && 0 === e.props.children.length && ( a = e.props, l = t.props, Object.keys( a ).length === Object.keys( l ).length && Object.keys( a ).every( ( e => "children" === e || l.hasOwnProperty( e ) && a[ e ] === l[ e ] ) ) ) ? ( e.props.children = t.props.children, e.dom = o = t.dom ) : n || ( p._propsProxy.set( e.props ), n = y( e, p ) ), n && ( e.props.children = ( 0, r.flattenChildren )( n ), e.dom = o = m( n, t ), e._ref = n._ref ), e._component = p, p.vnode = e, p._isDirty = !1 ) : e.dom = o = m( e, t ), f( e ), o instanceof Element && _( e, t ), p && !p.isMounted && ( 0, i.recursivelyUpdateMountState )( e, !0 ), p?._renderHandlers.map( ( e => e() ) )
	}
} ) ), o.register( "fhfO5", ( function ( t, n ) {
	e( t.exports, "createVNode", ( () => s ) ), e( t.exports, "cloneVNode", ( () => i ) ), e( t.exports, "h", ( () => p ) );
	var r = o( "2rWHf" );

	function s( e, t, n, r )
	{
		return { type: e, props: t, key: n, _ref: r }
	}

	function i( e )
	{
		return { ...e, props: { ...e.props } }
	}

	function p( e, t, ...n )
	{
		delete t.__self, delete t.__source;
		const { key: o, ref: i, ...p } = t;
		return p.children = ( n ?? [] ).map( ( e => -1 !== [ "string", "number" ].indexOf( typeof e ) ? s( r._TEXT_NODE_TYPE_NAME, { value: e + "" } ) : e ) ), s( e, p, o, i )
	}
} ) ), o.register( "fwkQu", ( function ( t, n ) {
	e( t.exports, "createComponentInstance", ( () => s ) ), e( t.exports, "recursivelyUpdateMountState", ( () => p ) );
	var r = o( "2rWHf" );

	function s( e )
	{
		return {
			vnode: e,
			_propsProxy: i( e.props ),
			_isDirty: !1,
			isMounted: !1,
			name: e.type.name,
			_mountHandlers: [],
			_renderHandlers: [],
			_unmountHandlers: [],
			_observables: []
		}
	}

	function i( e )
	{
		const t = new Proxy( {}, {
			get: ( t, n ) => n in e ? e[ n ] : void 0, set()
			{
				throw new ( 0, r.ReflexError )( "PropsProxy.set // Setting values to props manually is not allowed." )
			}
		} );
		return {
			get value()
			{
				return t
			}, set( t )
			{
				e = t
			}
		}
	}

	function p( e, t )
	{
		var n;
		e.type != r._TEXT_NODE_TYPE_NAME && ( ( 0, r.flattenChildren )( e ).map( ( e => e && p( e, t ) ) ), e._component && ( t ? ( ( n = e._component )._mountHandlers.map( ( e => {
			const t = e.apply( n, [] );
			"function" == typeof t && n._unmountHandlers.push( t )
		} ) ), n._mountHandlers = [], n.isMounted = !0 ) : function ( e ) {
			e._unmountHandlers.map( ( t => t.apply( e, [] ) ) ), e._observables.map( ( e => e.dispose() ) ), delete e._mountHandlers, delete e._renderHandlers, delete e._unmountHandlers, delete e._observables, e.isMounted = !1
		}( e._component ) ) )
	}
} ) ), o.register( "vCAeY", ( function ( t, n ) {
	e( t.exports, "render", ( () => p ) ), e( t.exports, "invalidateComponent", ( () => u ) );
	var r = o( "2rWHf" ), s = o( "4xUDA" ), i = o( "fhfO5" );

	function p( e, t )
	{
		const n = ( 0, i.createVNode )( r._ROOT_NODE_TYPE_NAME, { children: ( 0, r.forceArray )( e ) } );
		n.dom = t, ( 0, s.diffChildren )( n, t[ s._DOM_PRIVATE_VIRTUAL_NODE_KEY ] ), t[ s._DOM_PRIVATE_VIRTUAL_NODE_KEY ] = n
	}

	let a = [];

	function l()
	{
		a.map( ( e => {
			( 0, s.diffNode )( e.vnode, e.vnode )
		} ) ), a = []
	}

	function u( e )
	{
		0 === a.length && ( 0, r.microtask )( l ), e._isDirty || ( e._isDirty = !0, a.push( e ) )
	}
} ) ), o.register( "f58w7", ( function ( t, n ) {
	e( t.exports, "createStateObservable", ( () => i ) ), e( t.exports, "createAsyncObservable", ( () => p ) ), o( "8HdjB" );
	var r = o( "kvonT" );

	function s( e )
	{
		let t = function ( e ) {
			return "function" == typeof e ? e() : e
		}( e );
		const n = ( 0, r.Signal )(), { dispatch: o } = n;
		return n.dispatch = null, {
			onChanged: n, dispatch: o, get: () => t, set( e )
			{
				t = e
			}, dispose()
			{
				n.clear(), t = null
			}
		}
	}

	function i( e, t )
	{
		const n = s( e );
		return {
			onChanged: n.onChanged, dispose: n.dispose, get value()
			{
				return n.get()
			}, async set( e )
			{
				const r = n.get();
				if ( n.set( e ), t )
				{
					if ( !0 === await t( e, r ) ) return void n.set( r )
				}
				n.dispatch( e, r )
			}
		}
	}

	function p( e, t )
	{
		const n = s( e );
		let r = !1, o = !1;
		return {
			onChanged: n.onChanged, dispose: n.dispose, get value()
			{
				return n.get()
			}, get isChanging()
			{
				return r
			}, get wasAlreadyChanging()
			{
				return o
			}, async set( e )
			{
				const s = n.get();
				if ( n.set( e ), t )
				{
					r && ( o = !0 ), r = !0;
					if ( !0 === await t( e, s ) ) return n.set( s ), r = !1, void ( o = !1 );
					if ( r = !1, o ) return void ( o = !1 )
				}
				n.dispatch( e, s )
			}
		}
	}
} ) ), o.register( "8HdjB", ( function ( t, n ) {
	e( t.exports, "Signal", ( () => o( "kvonT" ).Signal ) ), o( "kvonT" ), o( "al5bW" ), o( "24DMN" )
} ) ), o.register( "kvonT", ( function ( t, n ) {
	function r()
	{
		let e = [];
		const t = t => e = e.filter( ( e => e[ 0 ] !== t ) );

		function n( n, r, o = !1 )
		{
			return e.push( [ n, r ] ), o && n.apply( null, Array.isArray( o ) ? o : null ), () => t( n )
		}

		return {
			add: ( e, t = !1 ) => n( e, !1, t ),
			once: e => n( e, !0 ),
			remove: t,
			dispatch: ( ...n ) => e.map( ( e => ( e[ 1 ] && t( e[ 0 ] ), e[ 0 ]( ...n ) ) ) ),
			clear()
			{
				e = []
			},
			get listeners()
			{
				return e.map( ( e => e[ 0 ] ) )
			}
		}
	}

	e( t.exports, "Signal", ( () => r ) )
} ) ), o.register( "al5bW", ( function ( e, t ) {
	o( "kvonT" )
} ) ), o.register( "24DMN", ( function ( e, t ) {
	o( "kvonT" )
} ) ), o.register( "1VBx6", ( function ( t, n ) {
	function r()
	{
		const e = {
			component: null, dom: null, setFromVNode( t )
			{
				e.dom = t.dom, e.component = t._component
			}
		};
		return e
	}

	function o()
	{
		const e = {
			list: [], setFromVNode( t, n )
			{
				null == n ? ( delete e.list[ t ], e.list.length-- ) : t in e.list ? ( e.list[ t ].component = n._component, e.list[ t ].dom = n.dom ) : e.list[ t ] = {
					dom: n.dom,
					component: n._component
				}
			}
		};
		return e
	}

	e( t.exports, "ref", ( () => r ) ), e( t.exports, "refs", ( () => o ) )
} ) ), o.register( "jqVIl", ( function ( t, n ) {
	e( t.exports, "mounted", ( () => s ) ), e( t.exports, "unmounted", ( () => i ) ), e( t.exports, "changed", ( () => p ) );
	var r = o( "4xUDA" );

	function s( e )
	{
		( 0, r.getHookedComponent )()._mountHandlers.push( e )
	}

	function i( e )
	{
		( 0, r.getHookedComponent )()._unmountHandlers.push( e )
	}

	function p( e, t )
	{
		const n = ( 0, r.getHookedComponent )();
		if ( !t ) return void n._renderHandlers.push( e );
		let o, s = e();

		function i( e )
		{
			o && o( e );
			const n = t( s, e );
			o = "function" == typeof n ? n : null
		}

		let p = !0;
		n._renderHandlers.push( ( () => {
			if ( p ) i( null ), p = !1; else
			{
				const t = s;
				s = e(), t != s && i( t )
			}
		} ) )
	}
} ) ), o.register( "3AbUl", ( function ( t, n ) {
	e( t.exports, "setReflexDebug", ( () => o ) ), e( t.exports, "trackPerformances", ( () => s ) );
	let r = !1;

	function o( e )
	{
		r = e
	}

	function s( e )
	{
		return () => {
		}
	}
} ) ), o.register( "hvc62", ( function ( t, n ) {
	e( t.exports, "createUID", ( () => o ) ), e( t.exports, "pickRandom", ( () => s ) ), e( t.exports, "rand", ( () => i ) ), e( t.exports, "randBoolean", ( () => p ) ), e( t.exports, "foodList", ( () => a ) ), e( t.exports, "colorList", ( () => l ) ), e( t.exports, "firstnameList", ( () => u ) ), e( t.exports, "lastnameList", ( () => c ) );
	const r = e => ( ~~e ).toString( 16 ), o = () => `${ r( Date.now() ) }-${ r( 999999999 * Math.random() ) }`,
		s = e => e[ ~~( Math.random() * e.length ) ], i = e => ~~( Math.random() * e ),
		p = ( e = .5 ) => Math.random() > e,
		a = [ "Cheese", "Carrots", "Pastas", "Pizza", "Burgers", "Ham", "Salad", "Mustard" ],
		l = [ "Red", "Blue", "Yellow", "Purple", "Orange", "Black", "White", "Green" ],
		u = [ "Alfred", "Jessica", "Gwen", "Jeanne" ], c = [ "Dupont", "Smith", "Stevensen", "Odea" ]
} ) );
//# sourceMappingURL=index.3e6a5651.js.map
