import {
    FiberRoot,
    ReactNodeList,
    PublicInstance,
    HostComponent,
    RootType,
    LegacyRoot,
    RootTag
} from './const';

type React$Element<T> = {};
export type Container =
    (Element & {_reactRootContainer?: RootType})
    | (Document & {_reactRootContainer?: RootType});

function render(
    element: React$Element<any>,
    container: Container,
    callback?: Function
) {
    return legacyRenderSubtreeIntoContainer(
        null,
        element as any,
        container,
        false,
        callback
    );
}

function legacyRenderSubtreeIntoContainer(
    parentComponent: any,
    children: ReactNodeList,
    container: Container,
    forceHydrate: boolean,
    callback?: Function
) {
    let root: RootType = container._reactRootContainer;
    let fiberRoot: FiberRoot;

    if (!root) {
        // Initial mount
        root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
            container,
            forceHydrate
        );
        // 这里 root 不应该是 ReactDOMRoot 对象吗
        fiberRoot = root._internalRoot;
        if (typeof callback === 'function') {
            // const originalCallback = callback;
            // callback = function() {
            //     const instance = getPublicRootInstance(fiberRoot);
            //     originalCallback.call(instance);
            // };
        }

        // Initial mount should not be batched.
        // 感觉 unbatchedUpdates 有点同步执行的意思
        // unbatchedUpdates(() => {
        //     updateContainer(children, fiberRoot, parentComponent, callback);
        // });
    } else {
        fiberRoot = root._internalRoot;
        if (typeof callback === 'function') {
            // const originalCallback = callback;
            // callback = function() {
            // const instance = getPublicRootInstance(fiberRoot);
            // originalCallback.call(instance);
        };
        // Update
        // updateContainer(children, fiberRoot, parentComponent, callback);
    }
    return getPublicRootInstance(fiberRoot);
}

function legacyCreateRootFromDOMContainer(container: Container, forceHy: boolean): RootType {
    return createLegacyRoot(
        container,
        forceHy
        ? {
            hydrate: true,
        }
        : undefined,
    );
}

function createLegacyRoot(
    container: Container,
    options: any
): RootType {
    return new ReactDOMBlockingRoot(container, LegacyRoot, options);
}

function ReactDOMBlockingRoot(
    container: Container,
    tag: RootTag,
    options: any,
) {
    this._internalRoot = createRootImpl(container, tag, options);
}

function createRootImpl(
    container: Container,
    tag: RootTag,
    options: any,
) {
    const root = createContainer(container, tag, false, false);
    markContainerAsRoot(root.current, container);

    return root;
}

export function getPublicInstance(instance: any): any {
    return instance;
}

export function getPublicRootInstance(
    container: FiberRoot,
): ReactComponent<any, any> | PublicInstance | null {
    const containerFiber = container.current;
    if (!containerFiber.child) {
        return null;
    }
    switch (containerFiber.child.tag) {
        // 所以这两种有什么区别
        case HostComponent:
            return getPublicInstance(containerFiber.child.stateNode);
        default:
            return containerFiber.child.stateNode;
    }
}

