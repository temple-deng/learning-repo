/**
 * 
 */

import {
    REACT_ELEMENT_TYPE,
    RefObject
} from './const';

// react/ReactElement.js
export const ReactElement = function (
    type,
    key,
    ref,
    self,
    source,
    owner,
    props
) {
    const element = {
        $$typeof: REACT_ELEMENT_TYPE,

        type: type,
        key: key,
        ref: ref,
        props: props,

        _owner: owner,
    };

    return element;
}

const RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true,
};

function createElement(type, config, children) {
    let ref = null;
    let key = null;
    let propName;
    const props: any = {};
    
    if (config !== null) {
        // config.ref !== undefined
        if (hasValidRef(config)) {
            ref = config.ref;
        }

        // config.key !== undefined
        if (hasValidKey(config)) {
            key = '' + config.key;

            for (propName in config) {
                if (config.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                    props[propName] = config[propName];
                }
            }
        }
    }

    const childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
        props.children = children;
    } else if (childrenLength > 1) {
        const childArray = Array(childrenLength);
        for (let i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 2];
        }

        props.children = childArray;
    }

    if (type && type.defaultProps) {
        const defaultProps = type.defaultProps;
        for (propName in defaultProps) {
            if (props[propName] === undefined) {
                props[propName] = defaultProps[propName];
            }
        }
    }

    let source = null;
    let self = null
    return ReactElement(
        type,
        key,
        ref,
        self,
        source,
        // ReactCurrentOwner.current: null | Fiber,
        {current: null},
        props,
    );
}

// react/ReactCreateRef.js
function createRef(): RefObject {
    const refObject = {
        current: null,
    };
    return refObject;
}

// react/ReactBaseClasses.js
const ReactNoopUpdateQueue = {
    isMounted: function (publicInstance) {
        return false;
    },

    enqueueSetState: function (
        publicInstance,
        partialState,
        callback,
        callerName
    ) {
        // empty
    }
}

function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = {};
    this.updater = updater || ReactNoopUpdateQueue;
}

Component.prototype.isReactComponent = {};

Component.prototype.setState = function (partialState, callback) {
    this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
